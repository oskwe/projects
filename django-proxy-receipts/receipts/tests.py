from datetime import date
from decimal import Decimal as D

from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.forms.models import model_to_dict
from django.test import Client, TestCase
from django.urls import reverse

from organizations.models import Organization
from products.models import Product
from .models import ReceiptAct, ReceiptItem
from .money import amount_in_words

ITEM_FIELDS = ['product', 'grade', 'account', 'analytic_code', 'quantity', 'fitness', 'price', 'card_number']


class ReceiptActTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_demo', verbosity=0)

    def setUp(self):
        self.act = ReceiptAct.objects.get(number='1')

    def payload(self, act=None):
        act = act or self.act
        data = model_to_dict(act, exclude=['id', 'snapshot'])
        data = {k: '' if v is None else v for k, v in data.items()}
        rows = list(act.items.all())
        data.update({'items-TOTAL_FORMS': str(len(rows)), 'items-INITIAL_FORMS': str(len(rows)),
                     'items-MIN_NUM_FORMS': '1', 'items-MAX_NUM_FORMS': '100'})
        for i, row in enumerate(rows):
            for key in ITEM_FIELDS + ['id']:
                value = getattr(row, key + '_id' if key == 'product' else key)
                data[f'items-{i}-{key}'] = '' if value is None else value
            data[f'items-{i}-act'] = act.pk
        return data

    def new_payload(self, number='Т-2'):
        data = self.payload()
        data['number'] = number
        data['items-INITIAL_FORMS'] = '0'
        for i in range(3):
            data.pop(f'items-{i}-id'); data.pop(f'items-{i}-act')
        return data

    def test_calculations_and_amount_in_words(self):
        totals = self.act.totals()
        self.assertEqual(totals['total'], D('57100.00'))
        self.assertEqual(totals['positions'], 3)
        self.assertFalse(totals['single_unit'])
        self.assertEqual(totals['in_words'], 'Пятьдесят семь тысяч сто рублей 00 копеек')
        brick = self.act.items.get(grade__startswith='М-150')
        self.assertEqual(brick.accepted_quantity, D('2000.000'))
        self.assertEqual(brick.price, D('9.50'))  # цена подставлена из справочника
        self.assertEqual(amount_in_words(D('1.01')), 'Один рубль 01 копейка')
        self.assertEqual(amount_in_words(D('2002')), 'Две тысячи два рубля 00 копеек')

    def test_pages_open(self):
        pk = self.act.pk
        for url in ['/', '/receipts/', '/receipts/create/', f'/receipts/view/{pk}/', f'/receipts/edit/{pk}/',
                    f'/receipts/copy/{pk}/', f'/receipts/print/{pk}/', f'/receipts/print/{pk}/?download=1',
                    f'/receipts/delete/{pk}/', '/receipts/?q=Югстрой', '/receipts/?q=нет-такого']:
            self.assertEqual(self.client.get(url).status_code, 200, url)
        for app in ['accounts', 'customers', 'departments', 'employees', 'organizations', 'positions',
                    'products', 'units', 'warehouses', 'proxies']:
            for action in ['list', 'create']:
                self.assertEqual(self.client.get(reverse(f'{app}:{action}')).status_code, 200, (app, action))

    def test_print_form_contents(self):
        response = self.client.get(f'/receipts/print/{self.act.pk}/')
        for text in ['0315006', 'ОБ ОПРИХОДОВАНИИ МАТЕРИАЛЬНЫХ ЦЕННОСТЕЙ', 'УТВЕРЖДАЮ', 'Пятьдесят семь тысяч сто рублей',
                     'Орлова М. И.', 'Иванов С. П.', 'М.П.', '57\xa0100,00', 'Печать', 'Назад', 'Сохранить']:
            self.assertContains(response, text)
        self.assertNotContains(response, 'org-seal')
        self.assertNotContains(response, 'toolbar')
        saved = self.client.get(f'/receipts/print/{self.act.pk}/?download=1')
        self.assertIn('attachment', saved['Content-Disposition'])
        self.assertContains(saved, '@page')  # стили встроены в файл
        self.assertContains(saved, 'ОБ ОПРИХОДОВАНИИ')
        self.assertNotContains(saved, 'doc-actions no-print')

    def test_create_edit_and_print_redirect(self):
        response = self.client.post('/receipts/create/', self.new_payload())
        created = ReceiptAct.objects.get(number='Т-2')
        self.assertRedirects(response, f'/receipts/view/{created.pk}/')
        self.assertEqual(created.items.count(), 3)
        data = self.payload(created); data['items-0-quantity'] = '3000'; data['action'] = 'print'
        response = self.client.post(f'/receipts/edit/{created.pk}/', data)
        self.assertRedirects(response, f'/receipts/print/{created.pk}/')
        self.assertEqual(created.items.first().quantity, D('3000'))

    def test_copy_prefills_and_saves_new_act(self):
        response = self.client.get(f'/receipts/copy/{self.act.pk}/')
        self.assertEqual(response.context['formset'].total_form_count(), 3)
        self.assertContains(response, 'Новый акт (копия)')
        data = self.new_payload('К-1')
        self.assertEqual(self.client.post(f'/receipts/copy/{self.act.pk}/', data).status_code, 302)
        self.assertEqual(ReceiptAct.objects.get(number='К-1').items.count(), 3)
        self.assertEqual(self.act.items.count(), 3)

    def test_add_and_delete_row(self):
        data = self.payload()
        data['items-TOTAL_FORMS'] = '4'
        data.update({'items-3-product': Product.objects.get(name__startswith='Труба').pk, 'items-3-account': '91.01',
                     'items-3-quantity': '10', 'items-3-fitness': '50', 'items-3-price': '', 'items-3-grade': ''})
        data['items-0-DELETE'] = 'on'
        self.assertEqual(self.client.post(f'/receipts/edit/{self.act.pk}/', data).status_code, 302)
        self.assertEqual(self.act.items.count(), 3)
        pipe = self.act.items.get(product__name__startswith='Труба')
        self.assertEqual(pipe.total, D('1200.00'))

    def test_validation_errors_do_not_save(self):
        url = f'/receipts/edit/{self.act.pk}/'
        cases = [
            ({'items-0-quantity': '0'}, 'Убедитесь, что это значение больше либо равно'),
            ({'items-0-fitness': '120'}, 'меньше либо равно 100'),
            ({'approval_date': '2026-09-01'}, 'нельзя утвердить раньше'),
            ({'member_first': ''}, 'Обязательное поле'),
            ({'items-0-DELETE': 'on', 'items-1-DELETE': 'on', 'items-2-DELETE': 'on'}, 'хотя бы одна позиция'),
        ]
        for changes, message in cases:
            data = self.payload(); data['number'] = 'ИЗМЕНЁН'; data.update(changes)
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, 200, changes)
            self.assertContains(response, message)
            self.act.refresh_from_db(); self.assertEqual(self.act.number, '1')
            self.assertEqual(self.act.items.count(), 3)

    def test_same_commission_member_rejected(self):
        data = self.payload(); data['member_first'] = data['chairman']
        self.assertContains(self.client.post(f'/receipts/edit/{self.act.pk}/', data), 'должны быть разными')

    def test_duplicate_number_and_rows_rejected(self):
        before = ReceiptAct.objects.count()
        self.assertEqual(self.client.post('/receipts/create/', self.new_payload('1')).status_code, 200)
        data = self.new_payload('3')
        for key in ITEM_FIELDS:
            data[f'items-1-{key}'] = data[f'items-0-{key}']
        self.assertContains(self.client.post('/receipts/create/', data), 'Одинаковые позиции')
        self.assertEqual(ReceiptAct.objects.count(), before)

    def test_snapshot_survives_catalog_changes(self):
        org = self.act.organization; org.name = 'Переименовано'; org.save()
        product = self.act.items.first().product; product.name = 'Другое имя'; product.save()
        self.act.save(); self.act.refresh_from_db()
        self.assertEqual(self.act.snapshot['organization']['name'], 'ООО «Югстройресурс»')
        self.assertNotContains(self.client.get(f'/receipts/print/{self.act.pk}/'), 'Другое имя')

    def test_storekeeper_from_warehouse(self):
        data = self.new_payload('4'); data['storekeeper'] = ''
        self.client.post('/receipts/create/', data)
        act = ReceiptAct.objects.get(number='4')
        self.assertEqual(act.storekeeper, act.warehouse.storekeeper)

    def test_delete_only_by_post_and_protected_catalogs(self):
        self.client.get(f'/receipts/delete/{self.act.pk}/')
        self.assertTrue(ReceiptAct.objects.filter(pk=self.act.pk).exists())
        for app, obj in [('organizations', self.act.organization), ('customers', self.act.contractor),
                         ('warehouses', self.act.warehouse), ('employees', self.act.chairman),
                         ('products', self.act.items.first().product), ('departments', self.act.department)]:
            response = self.client.post(reverse(f'{app}:delete', args=[obj.pk]))
            self.assertEqual(response.status_code, 302, app)
            self.assertTrue(type(obj).objects.filter(pk=obj.pk).exists(), app)
        pk = self.act.pk
        self.client.post(f'/receipts/delete/{pk}/')
        self.assertFalse(ReceiptAct.objects.filter(pk=pk).exists()); self.assertFalse(ReceiptItem.objects.filter(act_id=pk).exists())

    def test_demo_data_and_old_organization_replaced(self):
        self.assertEqual(ReceiptAct.objects.count(), 6)
        self.assertFalse(Organization.objects.filter(name__contains='Агрострой').exists())
        self.assertEqual(Organization.objects.count(), 3)
        home = self.client.get('/')
        self.assertContains(home, 'id="document-menu"')
        self.assertContains(home, 'class="logo-link"')
        self.assertContains(home, '>Документы</a>')
        self.assertNotContains(home, 'move_to_inbox'); self.assertNotContains(home, 'assignment_ind')
        for act in ReceiptAct.objects.all():
            self.assertGreater(act.totals()['total'], 0)
            self.assertEqual(self.client.get(f'/receipts/print/{act.pk}/').status_code, 200)
        call_command('seed_demo', verbosity=0)
        self.assertEqual(ReceiptAct.objects.count(), 6)

    def test_csrf_enforced(self):
        response = Client(enforce_csrf_checks=True).post(f'/receipts/delete/{self.act.pk}/')
        self.assertEqual(response.status_code, 403)

    def test_model_clean(self):
        self.act.approval_date = date(2026, 1, 1)
        with self.assertRaises(ValidationError):
            self.act.full_clean()
