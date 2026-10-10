"""Демонстрационные данные: справочники, акты оприходования и доверенности.

Все организации, люди и реквизиты вымышлены. Команда идемпотентна: повторный
запуск не создаёт дублей и не меняет записи, которые уже есть в базе.
"""
from datetime import date
from decimal import Decimal as D

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Account
from customers.models import Customer
from departments.models import Department
from employees.models import Employee
from organizations.models import Organization
from positions.models import Position
from products.models import Product
from proxies.models import Proxy, ProxyItem
from units.models import Unit
from warehouses.models import Warehouse
from receipts.models import ReceiptAct, ReceiptItem

OLD_ORGANIZATION = 'ООО «Кубань-Агрострой»'

ACCOUNTS = [
    ('40702810300000001234', 'АО «Учебный банк»', '040300101'),
    ('40702810500000005678', 'ПАО «Южный расчётный банк»', '040300202'),
    ('40702810700000009012', 'АО «Банк Приазовья»', '040300303'),
]

ORGANIZATIONS = [
    # название, адрес, счёт, руководитель, главный бухгалтер, ОКПО, ИНН
    ('ООО «Югстройресурс»', 'г. Краснодар, ул. Садовая, д. 14', 0, 'Лебедев В. Н.', 'Григорьева О. А.', '23456781', '2311000011'),
    ('АО «Приморский элеватор»', 'г. Новороссийск, ул. Портовая, д. 3', 1, 'Захаров Д. И.', 'Белова Н. С.', '34567812', '2315000022'),
    ('ООО «Нива-Сервис»', 'ст. Динская, ул. Красная, д. 55', 2, 'Тимофеев П. Р.', 'Медведева Т. Ю.', '45678123', '2330000033'),
]

DEPARTMENTS = ['Хозяйственный отдел', 'Бухгалтерия', 'Отдел капитального строительства', 'Производственный участок № 2']
POSITIONS = ['Заместитель директора', 'Главный инженер', 'Инженер', 'Бухгалтер', 'Кладовщик', 'Прораб', 'Мастер участка', 'Экономист']

EMPLOYEES = [
    # ключ, фамилия, имя, отчество, должность, серия, номер, табельный
    ('ivanov', 'Иванов', 'Сергей', 'Петрович', 'Заместитель директора', '0314', '512301', '001'),
    ('kuznetsov', 'Кузнецов', 'Олег', 'Викторович', 'Главный инженер', '0315', '612402', '002'),
    ('smirnova', 'Смирнова', 'Елена', 'Васильевна', 'Бухгалтер', '0316', '712503', '003'),
    ('orlova', 'Орлова', 'Марина', 'Игоревна', 'Кладовщик', '0317', '812604', '004'),
    ('fedorov', 'Фёдоров', 'Андрей', 'Николаевич', 'Инженер', '0318', '912705', '005'),
    ('pavlova', 'Павлова', 'Ирина', 'Сергеевна', 'Экономист', '0319', '112806', '006'),
    ('volkov', 'Волков', 'Дмитрий', 'Александрович', 'Мастер участка', '0320', '212907', '007'),
    ('sokolova', 'Соколова', 'Анна', 'Михайловна', 'Кладовщик', '0321', '313008', '008'),
    ('morozov', 'Морозов', 'Илья', 'Геннадьевич', 'Кладовщик', '0322', '413109', '009'),
    ('nikitina', 'Никитина', 'Ольга', 'Павловна', 'Бухгалтер', '0323', '513210', '010'),
]

UNITS = [('шт', '796'), ('кг', '166'), ('т', '168'), ('м3', '113'), ('м', '006'), ('м2', '055'), ('компл', '839')]

PRODUCTS = [
    # название, цена, ед., номенклатурный номер
    ('Кирпич керамический б/у', '9.50', 'шт', 'МТ-0101'),
    ('Металлолом стальной', '18000.00', 'т', 'МТ-0202'),
    ('Доска обрезная б/у', '6500.00', 'м3', 'МТ-0303'),
    ('Труба стальная 57 мм б/у', '240.00', 'м', 'МТ-0404'),
    ('Плита перекрытия ПК 60-15 б/у', '7800.00', 'шт', 'МТ-0505'),
    ('Блок оконный ПВХ б/у', '3200.00', 'шт', 'МТ-0606'),
    ('Профнастил С-21 б/у', '310.00', 'м2', 'МТ-0707'),
    ('Кабель ВВГ 3×2,5 б/у', '55.00', 'м', 'МТ-0808'),
    ('Радиатор чугунный МС-140 б/у', '1450.00', 'шт', 'МТ-0909'),
    ('Лом цветных металлов (медь)', '620.00', 'кг', 'МТ-1010'),
    ('Брус 150×150 б/у', '7200.00', 'м3', 'МТ-1111'),
    ('Двери металлические б/у', '4100.00', 'шт', 'МТ-1212'),
    ('Щебень из бетонного лома', '650.00', 'т', 'МТ-1313'),
    ('Электросчётчик б/у', '900.00', 'шт', 'МТ-1414'),
    ('Комплект ворот гаражных б/у', '15500.00', 'компл', 'МТ-1515'),
]

WAREHOUSES = [
    ('Центральный склад', 'г. Краснодар, ул. Складская, д. 5', 'orlova'),
    ('Склад стройматериалов № 2', 'г. Новороссийск, ул. Портовая, д. 3, стр. 7', 'sokolova'),
    ('Склад металлолома', 'ст. Динская, ул. Промышленная, д. 12', 'morozov'),
]

CONTRACTORS = ['ООО «ДемонтажСервис»', 'ООО «СпецРазбор»', 'ИП Громов Виктор Алексеевич', 'ООО «СтройЛиквидация»', 'ООО «Учебный поставщик»']

ACTS = [
    {
        'number': '1', 'date': date(2026, 9, 28), 'org': 0, 'dept': 'Хозяйственный отдел', 'contractor': 0,
        'warehouse': 'Центральный склад', 'object': 'Склад № 3 (разборка), г. Краснодар, ул. Садовая, д. 14',
        'basis': 'Приказ от 01.09.2026 № 45', 'activity': 'Строительство', 'op': '01',
        'commission': ('ivanov', 'kuznetsov', 'smirnova'), 'storekeeper': 'orlova',
        'rep': 'Прораб Сидоров Н. И.', 'approved': date(2026, 9, 29),
        'items': [
            ('Кирпич керамический б/у', 'М-150, 250×120×65', '2500', '80', None, '101'),
            ('Металлолом стальной', 'лом 3А', '1.250', '100', None, '102'),
            ('Доска обрезная б/у', 'сосна, 50×150', '3.200', '75', None, '103'),
        ],
    },
    {
        'number': '2', 'date': date(2026, 9, 3), 'org': 0, 'dept': 'Отдел капитального строительства', 'contractor': 1,
        'warehouse': 'Центральный склад', 'object': 'Административное здание (корпус Б), г. Краснодар, ул. Садовая, д. 14',
        'basis': 'Распоряжение от 20.08.2026 № 112-р', 'activity': 'Строительство', 'op': '01',
        'commission': ('kuznetsov', 'fedorov', 'pavlova'), 'storekeeper': 'orlova',
        'rep': 'Мастер Ковалёв Р. А.', 'approved': date(2026, 9, 4),
        'items': [
            ('Блок оконный ПВХ б/у', '1450×1200, двухстворчатый', '24', '70', None, '201'),
            ('Радиатор чугунный МС-140 б/у', '7 секций', '36', '85', None, '202'),
            ('Двери металлические б/у', '2000×900', '8', '60', '3500.00', '203'),
            ('Кабель ВВГ 3×2,5 б/у', '', '420', '50', None, '204'),
        ],
    },
    {
        'number': '14', 'date': date(2026, 8, 18), 'org': 1, 'dept': 'Производственный участок № 2', 'contractor': 3,
        'warehouse': 'Склад стройматериалов № 2', 'object': 'Зерносклад № 5 (демонтаж), г. Новороссийск, ул. Портовая, д. 3',
        'basis': 'Приказ от 05.08.2026 № 78', 'activity': 'Хранение зерна', 'op': '02',
        'commission': ('ivanov', 'volkov', 'nikitina'), 'storekeeper': 'sokolova',
        'rep': 'Начальник участка Ефимов С. В.', 'approved': date(2026, 8, 19),
        'items': [
            ('Профнастил С-21 б/у', 'оцинкованный, 0,5 мм', '640', '65', None, '1401'),
            ('Плита перекрытия ПК 60-15 б/у', '6000×1500', '12', '90', None, '1402'),
            ('Брус 150×150 б/у', 'сосна', '4.500', '70', None, '1403'),
            ('Щебень из бетонного лома', 'фракция 20–40', '38', '100', None, '1404'),
        ],
    },
    {
        'number': '15', 'date': date(2026, 9, 22), 'org': 1, 'dept': 'Хозяйственный отдел', 'contractor': 2,
        'warehouse': 'Склад стройматериалов № 2', 'object': 'Гараж на 4 бокса, г. Новороссийск, ул. Портовая, д. 3, стр. 9',
        'basis': 'Приказ от 10.09.2026 № 91', 'activity': 'Хранение зерна', 'op': '02',
        'commission': ('kuznetsov', 'fedorov', ''), 'storekeeper': 'sokolova',
        'rep': 'ИП Громов В. А.', 'approved': None,
        'items': [
            ('Комплект ворот гаражных б/у', 'распашные, 3000×2800', '4', '75', None, '1501'),
            ('Кирпич керамический б/у', 'М-100', '5200', '60', '8.00', '1502'),
            ('Электросчётчик б/у', 'однофазный', '4', '100', None, '1503'),
        ],
    },
    {
        'number': '7', 'date': date(2026, 7, 30), 'org': 2, 'dept': 'Производственный участок № 2', 'contractor': 0,
        'warehouse': 'Склад металлолома', 'object': 'Навес для техники, ст. Динская, ул. Промышленная, д. 12',
        'basis': 'Приказ от 15.07.2026 № 33', 'activity': 'Растениеводство', 'op': '03',
        'commission': ('ivanov', 'volkov', 'pavlova'), 'storekeeper': 'morozov',
        'rep': 'Прораб Сидоров Н. И.', 'approved': date(2026, 7, 31),
        'items': [
            ('Металлолом стальной', 'лом 5А, фермы и прогоны', '6.800', '100', None, '701'),
            ('Труба стальная 57 мм б/у', 'стойки', '180', '80', None, '702'),
            ('Лом цветных металлов (медь)', 'кабельная жила', '46.5', '100', None, '703'),
        ],
    },
    {
        'number': '8', 'date': date(2026, 9, 10), 'org': 2, 'dept': 'Хозяйственный отдел', 'contractor': 3,
        'warehouse': 'Склад металлолома', 'object': 'Котельная (демонтаж оборудования), ст. Динская, ул. Красная, д. 55',
        'basis': 'Распоряжение от 01.09.2026 № 17-р', 'activity': 'Растениеводство', 'op': '03',
        'commission': ('kuznetsov', 'volkov', 'nikitina'), 'storekeeper': 'morozov',
        'rep': 'Инженер Лукин А. П.', 'approved': date(2026, 9, 11),
        'items': [
            ('Радиатор чугунный МС-140 б/у', '10 секций', '14', '90', None, '801'),
            ('Труба стальная 57 мм б/у', 'подающий трубопровод', '96', '70', None, '802'),
            ('Металлолом стальной', 'котёл КВр-0,4 в разборе', '2.300', '100', None, '803'),
            ('Кабель ВВГ 3×2,5 б/у', '', '150', '80', None, '804'),
        ],
    },
]

PROXIES = [
    # организация, сотрудник, контрагент, дата выдачи, действует до, [(товар, количество)]
    (0, 'fedorov', 0, date(2026, 9, 1), date(2026, 9, 15), [('Труба стальная 57 мм б/у', 20)]),
    (1, 'volkov', 3, date(2026, 8, 10), date(2026, 8, 25), [('Профнастил С-21 б/у', 150), ('Брус 150×150 б/у', 2)]),
    (2, 'pavlova', 4, date(2026, 9, 5), date(2026, 9, 20), [('Кабель ВВГ 3×2,5 б/у', 300), ('Электросчётчик б/у', 5)]),
]


class Command(BaseCommand):
    help = 'Заполнить справочники и создать демонстрационные акты и доверенности (данные вымышлены, повторный запуск безопасен).'

    def add_arguments(self, parser):
        parser.add_argument('--if-empty', action='store_true', help='Заполнить только пустую базу (используется START.bat).')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['if_empty'] and Organization.objects.exists():
            self.stdout.write('База уже содержит данные — демонстрационный пример не добавлялся.')
            return

        accounts = [Account.objects.get_or_create(account=num, defaults={'bank_name': bank, 'bank_identity_number': bik})[0]
                    for num, bank, bik in ACCOUNTS]
        orgs = []
        for name, address, acc, chief, accountant, okpo, inn in ORGANIZATIONS:
            orgs.append(Organization.objects.get_or_create(name=name, defaults={
                'address': address, 'account': accounts[acc], 'chief': chief, 'financial_chief': accountant,
                'okpo': okpo, 'inn': inn})[0])
        depts = {name: Department.objects.get_or_create(name=name)[0] for name in DEPARTMENTS}
        for name in POSITIONS:
            Position.objects.get_or_create(name=name)
        people = {}
        for key, last, first, middle, post, series, number, tab in EMPLOYEES:
            people[key] = Employee.objects.get_or_create(last_name=last, first_name=first, defaults={
                'middle_name': middle, 'post': post, 'passport_series': series, 'passport_number': number,
                'passport_issued_by': 'ГУ МВД России по Краснодарскому краю', 'passport_date_of_issue': date(2018, 5, 12),
                'personnel_number': tab})[0]
        units = {name: Unit.objects.get_or_create(name=name, defaults={'code': code})[0] for name, code in UNITS}
        products = {}
        for name, price, unit, nom in PRODUCTS:
            products[name] = Product.objects.get_or_create(name=name, defaults={
                'price': D(price), 'unit': units[unit], 'nomenclature_number': nom})[0]
        warehouses = {}
        for name, address, keeper in WAREHOUSES:
            warehouses[name] = Warehouse.objects.get_or_create(name=name, defaults={'address': address, 'storekeeper': people[keeper]})[0]
        contractors = [Customer.objects.get_or_create(name=name)[0] for name in CONTRACTORS]

        self.replace_old_organization(orgs[0])

        created_acts = 0
        for spec in ACTS:
            org = orgs[spec['org']]
            if ReceiptAct.objects.filter(organization=org, number=spec['number'], date=spec['date']).exists():
                continue
            chairman, member_first, member_second = spec['commission']
            act = ReceiptAct.objects.create(
                number=spec['number'], date=spec['date'], organization=org, department=depts[spec['dept']],
                contractor=contractors[spec['contractor']], warehouse=warehouses[spec['warehouse']],
                object_name=spec['object'], basis=spec['basis'], activity=spec['activity'], operation_code=spec['op'],
                chairman=people[chairman], member_first=people[member_first],
                member_second=people[member_second] if member_second else None,
                storekeeper=people[spec['storekeeper']], contractor_representative=spec['rep'],
                approval_date=spec['approved'])
            for product, grade, qty, fitness, price, card in spec['items']:
                ReceiptItem.objects.create(act=act, product=products[product], grade=grade, account='91.01',
                                           quantity=D(qty), fitness=D(fitness),
                                           price=D(price) if price else None, card_number=card)
            created_acts += 1

        created_proxies = 0
        for org, person, contractor, issued, until, rows in PROXIES:
            proxy, created = Proxy.objects.get_or_create(
                organization=orgs[org], employee=people[person], customer=contractors[contractor],
                date_of_issue=issued, defaults={'is_valid_until': until})
            if created:
                for product, amount in rows:
                    ProxyItem.objects.create(proxy=proxy, product=products[product], amount=amount)
                created_proxies += 1

        self.stdout.write(self.style.SUCCESS(
            f'Демонстрационные данные готовы: добавлено актов {created_acts}, доверенностей {created_proxies}. '
            f'Всего актов в базе: {ReceiptAct.objects.count()}. Все реквизиты вымышлены.'))

    def replace_old_organization(self, new_org):
        """Прежний пример «Кубань-Агрострой» заменяется новой организацией во всех документах."""
        old = Organization.objects.filter(name=OLD_ORGANIZATION).first()
        if old is None:
            return
        for act in ReceiptAct.objects.filter(organization=old):
            duplicate = ReceiptAct.objects.filter(organization=new_org, number=act.number, date=act.date).exclude(pk=act.pk)
            if duplicate.exists():
                act.delete()
                continue
            act.organization = new_org
            act.save()  # снимок реквизитов обновляется, так как организация сменилась
        Proxy.objects.filter(organization=old).update(organization=new_org)
        old.delete()
        self.stdout.write(f'Организация {OLD_ORGANIZATION} заменена на {new_org.name}.')
