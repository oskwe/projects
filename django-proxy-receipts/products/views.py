from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from django.db.models import ProtectedError
from django.http import HttpResponseRedirect
from django.contrib import messages
from .models import Product

class ProductListView(ListView):
    model = Product
    queryset = Product.objects.select_related('unit')
    template_name = 'products/list.html'
    context_object_name = 'products'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = "Товары"
        return context

class ProductCreateView(SuccessMessageMixin, CreateView):
    model = Product
    fields = ['name', 'price', 'unit', 'nomenclature_number']
    template_name = 'products/create.html'
    success_url = reverse_lazy('products:list')
    success_message = "Товар успешно добавлен"

class ProductUpdateView(SuccessMessageMixin, UpdateView):
    model = Product
    fields = ['name', 'price', 'unit', 'nomenclature_number']
    template_name = 'products/edit.html'
    success_url = reverse_lazy('products:list')
    success_message = "Изменения сохранены"

class ProductDeleteView(DeleteView):
    model = Product
    success_url = reverse_lazy('products:list')
    template_name = 'products/delete.html'

    def form_valid(self, form):
        try:
            return super().form_valid(form)
        except ProtectedError:
            messages.error(self.request, 'Невозможно удалить: товар используется в других документах.')
            return HttpResponseRedirect(self.success_url)