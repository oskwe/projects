from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from django.db.models import ProtectedError
from django.http import HttpResponseRedirect
from django.contrib import messages
from .models import Position

class PositionListView(ListView):
    model = Position
    template_name = 'positions/list.html'
    context_object_name = 'positions'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = "Должности"
        return context

class PositionCreateView(SuccessMessageMixin, CreateView):
    model = Position
    fields = ['name']
    template_name = 'positions/create.html'
    success_url = reverse_lazy('positions:list')
    success_message = "Должность успешно добавлена"

class PositionUpdateView(SuccessMessageMixin, UpdateView):
    model = Position
    fields = ['name']
    template_name = 'positions/edit.html'
    success_url = reverse_lazy('positions:list')
    success_message = "Изменения сохранены"

class PositionDeleteView(DeleteView):
    model = Position
    success_url = reverse_lazy('positions:list')
    template_name = 'positions/delete.html'

    def form_valid(self, form):
        try:
            return super().form_valid(form)
        except ProtectedError:
            messages.error(self.request, 'Невозможно удалить: должность используется в других документах.')
            return HttpResponseRedirect(self.success_url)