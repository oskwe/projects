from django import forms
from django.forms import inlineformset_factory
from .models import Proxy, ProxyItem

class ProxyForm(forms.ModelForm):
    class Meta:
        model = Proxy
        fields = ['organization', 'employee', 'customer', 'date_of_issue', 'is_valid_until']
        widgets = {
            'date_of_issue': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'}),
            'is_valid_until': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'}),
        }

class ProxyItemForm(forms.ModelForm):
    class Meta:
        model = ProxyItem
        fields = ['product', 'amount']

ProxyItemFormSet = inlineformset_factory(
    Proxy,
    ProxyItem,
    form=ProxyItemForm,
    extra=0,
    can_delete=True,
    min_num=1,
    validate_min=True,
    max_num=100,
    validate_max=True,
)
