from django.db import models
from django.core.validators import RegexValidator


class Unit(models.Model):
    name = models.CharField("Название", max_length=50)
    code = models.CharField("Код по ОКЕИ", max_length=3, blank=True,
                            validators=[RegexValidator(r'^\d{3}$', 'Введите 3 цифры.')])

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Единица измерения"
        verbose_name_plural = "Единицы измерения"
