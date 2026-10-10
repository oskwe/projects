from django.test import TestCase, Client
from django.core.management import call_command
from django.forms.models import model_to_dict
from django.urls import reverse
from .models import Proxy


class ProxyTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_demo', verbosity=0)

    def setUp(self):
        self.proxy = Proxy.objects.get(employee__last_name='Фёдоров')

    def payload(self):
        data = model_to_dict(self.proxy, exclude=['id'])
        row = self.proxy.items.first()
        data.update({'items-TOTAL_FORMS': '1', 'items-INITIAL_FORMS': '1', 'items-MIN_NUM_FORMS': '1', 'items-MAX_NUM_FORMS': '100'})
        data.update({f'items-0-{key}': value for key, value in model_to_dict(row).items()})
        return data

    def test_create_edit_print_and_delete(self):
        data = self.payload(); data['items-INITIAL_FORMS'] = '0'; data.pop('items-0-id'); data.pop('items-0-proxy')
        self.assertEqual(self.client.post(reverse('proxies:create'), data).status_code, 302)
        new = Proxy.objects.latest('id'); self.assertEqual(new.items.get().amount, 20)
        data = self.payload(); data['items-0-amount'] = '3'; data['action'] = 'print'
        response = self.client.post(reverse('proxies:edit', args=[self.proxy.pk]), data)
        self.assertRedirects(response, reverse('proxies:view', args=[self.proxy.pk]))
        self.assertEqual(self.proxy.items.get().amount, 3)
        self.client.get(reverse('proxies:delete', args=[new.pk])); self.assertTrue(Proxy.objects.filter(pk=new.pk).exists())
        self.client.post(reverse('proxies:delete', args=[new.pk])); self.assertFalse(Proxy.objects.filter(pk=new.pk).exists())

    def test_invalid_data_not_saved(self):
        url = reverse('proxies:edit', args=[self.proxy.pk])
        for changes in [{'is_valid_until': '2026-08-01'}, {'items-0-amount': '0'}, {'items-0-DELETE': 'on'}]:
            data = self.payload(); data.update(changes)
            self.assertEqual(self.client.post(url, data).status_code, 200)
            self.proxy.refresh_from_db(); self.assertEqual(self.proxy.items.get().amount, 20)

    def test_print_form_with_seal_and_escape(self):
        product = self.proxy.items.get().product; product.name = '<script>alert(1)</script>'; product.save()
        response = self.client.get(reverse('proxies:view', args=[self.proxy.pk]))
        self.assertContains(response, 'Фёдоров Андрей Николаевич'); self.assertContains(response, 'org-seal')
        self.assertContains(response, '12.05.2018')
        self.assertContains(response, '&lt;script&gt;'); self.assertNotContains(response, '<script>alert(1)</script>')

    def test_csrf_and_errors(self):
        self.assertEqual(Client(enforce_csrf_checks=True).post(reverse('proxies:delete', args=[self.proxy.pk])).status_code, 403)
        self.assertContains(self.client.post(reverse('proxies:create'), {}), 'Исправьте ошибки')

    def test_reference_catalog_crud(self):
        from accounts.models import Account
        from customers.models import Customer
        from departments.models import Department
        from employees.models import Employee
        from organizations.models import Organization
        from positions.models import Position
        from products.models import Product
        from units.models import Unit
        from warehouses.models import Warehouse
        examples = [
            ('accounts', Account, {'account': '40700000000000000000', 'bank_name': 'Учебный банк', 'bank_identity_number': '040000000'}),
            ('customers', Customer, {'name': 'Тестовый контрагент'}),
            ('departments', Department, {'name': 'Тестовый отдел'}),
            ('positions', Position, {'name': 'Тестовая должность'}),
            ('units', Unit, {'name': 'л', 'code': '112'}),
            ('organizations', Organization, {'name': 'Тестовая организация', 'chief': 'Руководитель', 'address': 'Адрес', 'financial_chief': 'Бухгалтер', 'okpo': '87654321', 'inn': '2310000002'}),
            ('employees', Employee, {'last_name': 'Тестов', 'first_name': 'Пётр', 'post': 'Инженер'}),
            ('products', Product, {'name': 'Тестовый товар', 'price': '10.50', 'unit': Unit.objects.first().pk}),
            ('warehouses', Warehouse, {'name': 'Склад № 2', 'address': '', 'storekeeper': ''}),
        ]
        for app, model, data in examples:
            count = model.objects.count()
            self.assertEqual(self.client.post(reverse(f'{app}:create'), data).status_code, 302, app)
            obj = model.objects.latest('pk'); self.assertEqual(model.objects.count(), count + 1)
            self.assertEqual(self.client.get(reverse(f'{app}:edit', args=[obj.pk])).status_code, 200, app)
            self.assertEqual(self.client.post(reverse(f'{app}:edit', args=[obj.pk]), data).status_code, 302, app)
            self.assertEqual(self.client.post(reverse(f'{app}:delete', args=[obj.pk])).status_code, 302, app)
            self.assertEqual(model.objects.count(), count, app)
        # Счёт используется организацией — удаление запрещено, запись сохраняется.
        account = Organization.objects.first().account
        self.client.post(reverse('accounts:delete', args=[account.pk]))
        self.assertTrue(Account.objects.filter(pk=account.pk).exists())
