from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from django.db.models import ProtectedError
from django.http import HttpResponseRedirect
from django.contrib import messages
from .models import Account


class AccountListView(ListView):
    model = Account  # Это обязательное поле
    template_name = 'accounts/list.html'
    context_object_name = 'accounts'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = "Счета"
        return context


class AccountCreateView(SuccessMessageMixin, CreateView):
    model = Account
    fields = ['account', 'bank_name', 'bank_identity_number']
    template_name = 'accounts/create.html'
    success_url = reverse_lazy('accounts:list')
    success_message = "Счёт успешно добавлен"


class AccountUpdateView(SuccessMessageMixin, UpdateView):
    model = Account
    fields = ['account', 'bank_name', 'bank_identity_number']
    template_name = 'accounts/edit.html'
    success_url = reverse_lazy('accounts:list')
    success_message = "Изменения сохранены"


class AccountDeleteView(DeleteView):
    model = Account
    success_url = reverse_lazy('accounts:list')
    template_name = 'accounts/delete.html'

    def form_valid(self, form):
        try:
            return super().form_valid(form)
        except ProtectedError:
            messages.error(self.request, 'Невозможно удалить: счёт указан у организации.')
            return HttpResponseRedirect(self.success_url)
