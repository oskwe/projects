from django.db import models
from employees.models import Employee


class Warehouse(models.Model):
    name = models.CharField("Название склада", max_length=150)
    address = models.CharField("Адрес", max_length=255, blank=True)
    storekeeper = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        verbose_name="Кладовщик (материально ответственное лицо)",
        null=True,
        blank=True,
        related_name='warehouses'
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Склад"
        verbose_name_plural = "Склады"
        ordering = ['name']
