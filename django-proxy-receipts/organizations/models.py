from django.db import models
from django.core.validators import RegexValidator
from accounts.models import Account


class Organization(models.Model):
    name = models.CharField("Название", max_length=255)
    address = models.CharField("Адрес", max_length=255, blank=True)
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        verbose_name="Счёт",
        null=True,
        blank=True
    )
    chief = models.CharField("Руководитель", max_length=100)
    financial_chief = models.CharField("Главный бухгалтер", max_length=100, blank=True)
    # Дополнительные реквизиты для акта оприходования (форма № М-35)
    okpo = models.CharField("ОКПО", max_length=10, blank=True,
                            validators=[RegexValidator(r'^\d{8}(\d{2})?$', 'Введите 8 или 10 цифр.')])
    inn = models.CharField("ИНН", max_length=12, blank=True,
                           validators=[RegexValidator(r'^(\d{10}|\d{12})$', 'Введите 10 или 12 цифр.')])

    def __str__(self):
        return self.name

    @property
    def chief_short_name(self):
        return self.chief

    @property
    def accountant_short_name(self):
        return self.financial_chief

    class Meta:
        verbose_name = "Организация"
        verbose_name_plural = "Организации"
