from django import forms
from django.forms import BaseInlineFormSet, inlineformset_factory
from .models import ReceiptAct, ReceiptItem

DATE = {'type': 'date'}


class ReceiptActForm(forms.ModelForm):
    class Meta:
        model = ReceiptAct
        fields = [
            'number', 'date', 'organization', 'department', 'contractor', 'warehouse',
            'object_name', 'basis', 'activity', 'operation_code', 'okud',
            'chairman', 'member_first', 'member_second', 'storekeeper',
            'contractor_representative', 'approval_date', 'note',
        ]
        widgets = {
            'date': forms.DateInput(format='%Y-%m-%d', attrs=DATE),
            'approval_date': forms.DateInput(format='%Y-%m-%d', attrs=DATE),
        }


class ReceiptItemForm(forms.ModelForm):
    class Meta:
        model = ReceiptItem
        fields = ['product', 'grade', 'account', 'analytic_code', 'quantity', 'fitness', 'price', 'card_number']
        widgets = {
            'quantity': forms.NumberInput(attrs={'step': '0.001', 'min': '0.001'}),
            'fitness': forms.NumberInput(attrs={'step': '0.01', 'min': '0.01', 'max': '100'}),
            'price': forms.NumberInput(attrs={'step': '0.01', 'min': '0'}),
        }


class BaseReceiptItemFormSet(BaseInlineFormSet):
    default_error_messages = {
        'too_few_forms': 'В акте должна остаться хотя бы одна позиция.',
        'too_many_forms': 'В одном акте допускается не более %(num)d позиций.',
    }

    def clean(self):
        super().clean()
        if any(self.errors):
            return
        seen = set()
        for form in self.forms:
            data = form.cleaned_data
            if not data or data.get('DELETE'):
                continue
            key = (data.get('product'), (data.get('grade') or '').strip().lower(), data.get('fitness'), data.get('price'))
            if key in seen:
                raise forms.ValidationError('Одинаковые позиции повторяются. Объедините их в одну строку и сложите количество.')
            seen.add(key)


ReceiptItemFormSet = inlineformset_factory(
    ReceiptAct,
    ReceiptItem,
    form=ReceiptItemForm,
    formset=BaseReceiptItemFormSet,
    extra=0,
    can_delete=True,
    min_num=1,
    validate_min=True,
    max_num=100,
    validate_max=True,
)
