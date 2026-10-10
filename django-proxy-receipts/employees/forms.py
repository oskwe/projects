from django import forms
from .models import Employee


class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = [
            'last_name', 'first_name', 'middle_name', 'post',
            'passport_series', 'passport_number',
            'passport_issued_by', 'passport_date_of_issue', 'personnel_number'
        ]
        widgets = {'passport_date_of_issue': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'})}
