from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from django.db.models import ProtectedError
from django.http import HttpResponseRedirect
from django.contrib import messages
from .models import Warehouse


class WarehouseListView(ListView):
    model = Warehouse
    queryset = Warehouse.objects.select_related('storekeeper')
    template_name = 'warehouses/list.html'
    context_object_name = 'warehouses'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = "Склады"
        return context


class WarehouseCreateView(SuccessMessageMixin, CreateView):
    model = Warehouse
    fields = ['name', 'address', 'storekeeper']
    template_name = 'warehouses/create.html'
    success_url = reverse_lazy('warehouses:list')
    success_message = "Склад успешно добавлен"


class WarehouseUpdateView(SuccessMessageMixin, UpdateView):
    model = Warehouse
    fields = ['name', 'address', 'storekeeper']
    template_name = 'warehouses/edit.html'
    success_url = reverse_lazy('warehouses:list')
    success_message = "Изменения сохранены"


class WarehouseDeleteView(DeleteView):
    model = Warehouse
    success_url = reverse_lazy('warehouses:list')
    template_name = 'warehouses/delete.html'

    def form_valid(self, form):
        try:
            return super().form_valid(form)
        except ProtectedError:
            messages.error(self.request, 'Невозможно удалить: склад используется в актах оприходования.')
            return HttpResponseRedirect(self.success_url)
