from pathlib import Path
from urllib.parse import quote

from django.contrib import messages
from django.contrib.staticfiles import finders
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from products.models import Product
from warehouses.models import Warehouse
from .forms import ReceiptActForm, ReceiptItemFormSet
from .models import ReceiptAct, ReceiptItem


def journal(request):
    q = request.GET.get('q', '').strip()
    acts = ReceiptAct.objects.select_related('organization', 'contractor', 'warehouse').prefetch_related('items')
    if q:
        acts = acts.filter(
            Q(number__icontains=q) | Q(organization__name__icontains=q) |
            Q(contractor__name__icontains=q) | Q(object_name__icontains=q)
        )
    page = Paginator(acts, 15).get_page(request.GET.get('page'))
    return render(request, 'receipts/journal.html', {
        'page': page, 'q': q, 'count': acts.count(), 'page_title': 'Акты оприходования',
    })


def _catalog_data():
    """Цены и единицы товаров, склады с кладовщиками — для подсказок в форме."""
    products = {
        str(p.pk): {'price': str(p.price), 'unit': p.unit.name, 'code': p.unit.code, 'nomenclature': p.nomenclature_number}
        for p in Product.objects.select_related('unit')
    }
    warehouses = {str(w.pk): w.storekeeper_id for w in Warehouse.objects.all()}
    return {'products': products, 'warehouses': warehouses}


def edit_act(request, pk=None, copy_from=None):
    act = get_object_or_404(ReceiptAct, pk=pk) if pk else ReceiptAct()
    initial, item_initial = {}, []
    if copy_from and request.method != 'POST':
        source = get_object_or_404(ReceiptAct, pk=copy_from)
        initial = {field: getattr(source, field) for field in ReceiptActForm.Meta.fields
                   if field not in ['number', 'date', 'approval_date']}
        initial['date'] = timezone.localdate()
        item_initial = [
            {field: getattr(item, field) for field in ['product', 'grade', 'account', 'analytic_code', 'quantity', 'fitness', 'price', 'card_number']}
            for item in source.items.all()
        ]
    elif not pk and request.method != 'POST':
        initial = {'date': timezone.localdate(), 'okud': '0315006'}
    form = ReceiptActForm(request.POST or None, instance=act, initial=initial)
    # Заголовок проверяется первым: его данные нужны строкам.
    valid_header = form.is_valid() if request.method == 'POST' else False
    formset = ReceiptItemFormSet(request.POST or None, instance=act, prefix='items',
                                 initial=item_initial or None)
    if item_initial:
        formset.extra = len(item_initial)
        formset.min_num = 0
    if request.method == 'POST':
        valid_items = formset.is_valid()
        if valid_header and valid_items:
            with transaction.atomic():
                act = form.save()
                formset.instance = act
                formset.save()
            messages.success(request, f'Акт оприходования № {act.number} сохранён.')
            if request.POST.get('action') == 'print':
                return redirect('receipts:print', pk=act.pk)
            return redirect('receipts:detail', pk=act.pk)
    return render(request, 'receipts/edit.html', {
        'form': form, 'formset': formset, 'act': act, 'copy_from': copy_from,
        'catalog': _catalog_data(),
        'page_title': 'Акт оприходования',
    })


def copy_act(request, pk):
    return edit_act(request, copy_from=pk)


def _load(pk):
    return get_object_or_404(
        ReceiptAct.objects.select_related('organization', 'contractor', 'warehouse', 'department')
        .prefetch_related('items'), pk=pk)


def detail(request, pk):
    act = _load(pk)
    return render(request, 'receipts/detail.html', {'act': act, 'totals': act.totals(), 'page_title': 'Акт оприходования'})


def delete_act(request, pk):
    act = get_object_or_404(ReceiptAct, pk=pk)
    if request.method == 'POST':
        number = act.number
        act.delete()
        messages.success(request, f'Акт № {number} удалён.')
        return redirect('receipts:list')
    return render(request, 'receipts/delete.html', {'object': act})


def print_act(request, pk):
    """Печатная форма. С параметром ?download=1 отдаёт документ файлом (кнопка «Сохранить»)."""
    act = _load(pk)
    rows = list(act.items.all())
    download = request.GET.get('download') == '1'
    context = {
        'act': act, 'rows': rows, 'totals': act.totals(), 'numbers': range(1, 13),
        'blank_rows': range(max(0, 3 - len(rows))), 'download': download,
    }
    if download:
        css = finders.find('css/receipt-print.css')
        context['inline_css'] = Path(css).read_text(encoding='utf-8') if css else ''
        response = render(request, 'receipts/print.html', context)
        filename = f"Акт_оприходования_№{act.number}_от_{act.date:%d.%m.%Y}.html"
        response['Content-Disposition'] = f"attachment; filename=\"akt_{act.pk}.html\"; filename*=UTF-8''{quote(filename)}"
        return response
    return render(request, 'receipts/print.html', context)
