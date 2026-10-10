from django.db import models


class Employee(models.Model):
    last_name = models.CharField("Фамилия", max_length=100)
    first_name = models.CharField("Имя", max_length=100)
    middle_name = models.CharField("Отчество", max_length=100, blank=True)
    post = models.CharField("Должность", max_length=200)
    passport_series = models.CharField("Серия паспорта", max_length=10, blank=True)
    passport_number = models.CharField("Номер паспорта", max_length=20, blank=True)
    passport_issued_by = models.CharField("Кем выдан", max_length=255, blank=True)
    passport_date_of_issue = models.DateField("Дата выдачи", null=True, blank=True)
    # Дополнительный реквизит для акта оприходования
    personnel_number = models.CharField("Табельный номер", max_length=20, blank=True)

    def __str__(self):
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()

    @property
    def full_name(self):
        return str(self)

    @property
    def short_name(self):
        """Фамилия и инициалы для расшифровки подписи: «Иванов С. П.»."""
        initials = ' '.join(f'{part[0]}.' for part in [self.first_name, self.middle_name] if part)
        return f"{self.last_name} {initials}".strip()

    class Meta:
        verbose_name = "Сотрудник"
        verbose_name_plural = "Сотрудники"
        ordering = ['last_name', 'first_name']
