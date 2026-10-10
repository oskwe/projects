"""Документ «Акт об оприходовании материальных ценностей» (по составу граф формы № М-35)."""
from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.db import models

from customers.models import Customer
from departments.models import Department
from employees.models import Employee
from organizations.models import Organization
from products.models import Product
from warehouses.models import Warehouse
from .money import amount_in_words


def money(value):
    return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def quantity3(value):
    return Decimal(value).quantize(Decimal('0.001'), rounding=ROUND_HALF_UP)


class ReceiptAct(models.Model):
    number = models.CharField("Номер акта", max_length=20)
    date = models.DateField("Дата составления")
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        verbose_name="Организация (заказчик)",
        related_name='receipt_acts'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        verbose_name="Структурное подразделение",
        null=True,
        blank=True,
        related_name='receipt_acts'
    )
    contractor = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        verbose_name="Подрядчик",
        related_name='receipt_acts'
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        verbose_name="Склад (место хранения)",
        related_name='receipt_acts'
    )
    object_name = models.CharField("Объект разборки (демонтажа): наименование и адрес", max_length=255)
    basis = models.CharField("Основание (приказ, распоряжение)", max_length=200, blank=True)
    activity = models.CharField("Вид деятельности", max_length=100, blank=True)
    operation_code = models.CharField("Вид операции (код)", max_length=10, blank=True)
    okud = models.CharField("Форма по ОКУД", max_length=7, default='0315006', blank=True,
                            validators=[RegexValidator(r'^\d{7}$', 'Введите 7 цифр.')])
    chairman = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        verbose_name="Председатель комиссии",
        related_name='chaired_receipt_acts'
    )
    member_first = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        verbose_name="Член комиссии",
        related_name='receipt_acts_as_member'
    )
    member_second = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        verbose_name="Член комиссии (второй)",
        related_name='receipt_acts_as_second_member',
        null=True,
        blank=True
    )
    storekeeper = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        verbose_name="Принял (кладовщик)",
        related_name='received_acts',
        null=True,
        blank=True,
        help_text="Если не выбрано, берётся кладовщик склада."
    )
    contractor_representative = models.CharField("Представитель подрядчика (должность, ФИО)", max_length=150)
    approval_date = models.DateField("Дата утверждения руководителем", null=True, blank=True)
    note = models.CharField("Примечание", max_length=255, blank=True)
    # Реквизиты справочников на момент составления акта: печатная форма не меняется
    # при последующем редактировании справочников.
    snapshot = models.JSONField(default=dict, editable=False)

    class Meta:
        verbose_name = "Акт оприходования"
        verbose_name_plural = "Акты оприходования"
        ordering = ['-date', '-pk']
        constraints = [
            models.UniqueConstraint(fields=['organization', 'number', 'date'], name='unique_receipt_act_number_date'),
        ]

    def __str__(self):
        return f"Акт оприходования № {self.number}"

    def clean(self):
        super().clean()
        errors = {}
        if self.date and self.approval_date and self.approval_date < self.date:
            errors['approval_date'] = 'Акт нельзя утвердить раньше даты составления.'
        members = [self.chairman_id, self.member_first_id, self.member_second_id]
        chosen = [pk for pk in members if pk]
        if len(chosen) != len(set(chosen)):
            errors['member_first'] = 'Члены комиссии должны быть разными людьми.'
        if self.storekeeper_id is None and self.warehouse_id and not self.warehouse.storekeeper_id:
            errors['storekeeper'] = 'Выберите кладовщика: у выбранного склада он не указан.'
        if errors:
            raise ValidationError(errors)

    def people(self):
        return {
            'chairman': self.chairman,
            'member_first': self.member_first,
            'member_second': self.member_second,
            'storekeeper': self.storekeeper or (self.warehouse.storekeeper if self.warehouse_id else None),
        }

    def save(self, *args, **kwargs):
        if self.storekeeper_id is None and self.warehouse_id:
            self.storekeeper_id = self.warehouse.storekeeper_id
        previous = type(self).objects.filter(pk=self.pk).first() if self.pk else None
        snap = dict(self.snapshot or {})
        sources = {
            'organization': (self.organization, ['name', 'address', 'okpo', 'inn', 'chief', 'financial_chief']),
            'contractor': (self.contractor, ['name']),
            'warehouse': (self.warehouse, ['name', 'address']),
            'department': (self.department, ['name']),
        }
        for key, (obj, fields) in sources.items():
            changed = previous is None or getattr(previous, key + '_id') != getattr(self, key + '_id')
            if key not in snap or changed:
                snap[key] = {field: getattr(obj, field) for field in fields} if obj else {}
        for key, person in self.people().items():
            changed = previous is None or getattr(previous, key + '_id', None) != getattr(self, key + '_id', None)
            if key not in snap or changed:
                snap[key] = {'full_name': person.full_name, 'short_name': person.short_name, 'post': person.post} if person else {}
        self.snapshot = snap
        super().save(*args, **kwargs)

    def totals(self):
        rows = list(self.items.all())
        total = sum((row.total for row in rows), Decimal('0.00'))
        units = {row.unit_snapshot for row in rows}
        result = {
            'positions': len(rows),
            'total': total,
            'in_words': amount_in_words(total),
            'single_unit': len(units) == 1,
        }
        # Натуральные количества складываются только в одной единице измерения.
        if result['single_unit']:
            result['quantity'] = sum((row.quantity for row in rows), Decimal(0))
            result['accepted_quantity'] = sum((row.accepted_quantity for row in rows), Decimal(0))
        return result


class ReceiptItem(models.Model):
    act = models.ForeignKey(
        ReceiptAct,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Акт"
    )
    account = models.CharField("Корреспондирующий счёт, субсчёт", max_length=20, default='91.01')
    analytic_code = models.CharField("Код аналитического учёта", max_length=20, blank=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        verbose_name="Материальная ценность"
    )
    grade = models.CharField("Сорт, марка, размер", max_length=120, blank=True)
    quantity = models.DecimalField(
        "Количество, полученное при разборке",
        max_digits=12, decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))]
    )
    fitness = models.DecimalField(
        "Процент годности, %",
        max_digits=5, decimal_places=2, default=Decimal('100'),
        validators=[MinValueValidator(Decimal('0.01')), MaxValueValidator(Decimal('100'))]
    )
    price = models.DecimalField(
        "Цена, руб. коп.",
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        help_text="Пусто — цена из справочника товаров."
    )
    card_number = models.CharField("Номер по складской картотеке", max_length=20, blank=True)
    # Снимок реквизитов товара для печатной формы
    name_snapshot = models.CharField(max_length=255, editable=False, blank=True)
    nomenclature_snapshot = models.CharField(max_length=30, editable=False, blank=True)
    unit_snapshot = models.CharField(max_length=50, editable=False, blank=True)
    unit_code_snapshot = models.CharField(max_length=3, editable=False, blank=True)

    class Meta:
        verbose_name = "Позиция акта"
        verbose_name_plural = "Позиции акта"
        ordering = ['pk']

    def __str__(self):
        return self.name_snapshot or str(self.product)

    def save(self, *args, **kwargs):
        if self.price is None:
            self.price = self.product.price
        old = type(self).objects.filter(pk=self.pk).first() if self.pk else None
        if not self.name_snapshot or old and old.product_id != self.product_id:
            self.name_snapshot = self.product.name
            self.nomenclature_snapshot = self.product.nomenclature_number
            self.unit_snapshot = self.product.unit.name
            self.unit_code_snapshot = self.product.unit.code
        super().save(*args, **kwargs)

    @property
    def accepted_quantity(self):
        """Графа 9: количество годных ценностей, принимаемых на учёт."""
        return quantity3(self.quantity * self.fitness / 100)

    @property
    def total(self):
        """Графа 11: сумма = годное количество × цена."""
        return money(self.accepted_quantity * (self.price or 0))
