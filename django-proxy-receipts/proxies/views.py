from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.urls import reverse_lazy
from django.db import transaction
from django.shortcuts import redirect
from django.contrib import messages
from django.utils import timezone
from .models import Proxy
from .forms import ProxyForm, ProxyItemFormSet

class ProxyListView(ListView):
    model = Proxy
    template_name = 'proxies/list.html'
    context_object_name = 'proxies'
    def get_queryset(self):
        return Proxy.objects.select_related('organization', 'employee', 'customer').order_by('-date_of_issue', '-pk')

class ProxyFormsetMixin:
    model = Proxy
    form_class = ProxyForm
    template_name = 'proxies/form.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.setdefault('formset', ProxyItemFormSet(self.request.POST or None, instance=self.object, prefix='items'))
        return context
    def form_valid(self, form):
        formset = ProxyItemFormSet(self.request.POST, instance=form.instance, prefix='items')
        if not formset.is_valid():
            return self.render_to_response(self.get_context_data(form=form, formset=formset))
        with transaction.atomic():
            self.object = form.save()
            formset.instance = self.object
            formset.save()
        messages.success(self.request, 'Доверенность сохранена.')
        if self.request.POST.get('action') == 'print': return redirect('proxies:view', pk=self.object.pk)
        return redirect('proxies:list')

class ProxyCreateView(ProxyFormsetMixin, CreateView):
    pass
class ProxyUpdateView(ProxyFormsetMixin, UpdateView):
    pass
class ProxyDeleteView(DeleteView):
    model = Proxy
    success_url = reverse_lazy('proxies:list')
    template_name = 'proxies/delete.html'
class ProxyDetailView(DetailView):
    model = Proxy
    template_name = 'proxies/view.html'
    context_object_name = 'proxy'
    def get_queryset(self):
        return Proxy.objects.select_related('organization', 'employee', 'customer').prefetch_related('items__product__unit')
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['current_date'] = timezone.localdate()
        return context
