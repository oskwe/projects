CREATE SCHEMA IF NOT EXISTS lab10;

CREATE TABLE IF NOT EXISTS lab10.categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES lab10.categories(id) ON DELETE RESTRICT,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
  image TEXT
);

CREATE TABLE IF NOT EXISTS lab10.orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(180) NOT NULL,
  customer_phone VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab10.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES lab10.orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES lab10.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price INTEGER NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS lab10.departments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.positions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.persons (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS lab10.teachers (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES lab10.persons(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES lab10.departments(id) ON DELETE RESTRICT,
  position_id INTEGER NOT NULL REFERENCES lab10.positions(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lab10.study_groups (
  id SERIAL PRIMARY KEY,
  title VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.buildings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL UNIQUE,
  address VARCHAR(220) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS lab10.classrooms (
  id SERIAL PRIMARY KEY,
  building_id INTEGER NOT NULL REFERENCES lab10.buildings(id) ON DELETE RESTRICT,
  title VARCHAR(80) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0)
);

CREATE TABLE IF NOT EXISTS lab10.disciplines (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.lesson_types (
  id SERIAL PRIMARY KEY,
  title VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.schedule_lessons (
  id SERIAL PRIMARY KEY,
  week INTEGER NOT NULL CHECK (week IN (1, 2)),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  start_time TIME NOT NULL,
  group_id INTEGER NOT NULL REFERENCES lab10.study_groups(id) ON DELETE RESTRICT,
  classroom_id INTEGER NOT NULL REFERENCES lab10.classrooms(id) ON DELETE RESTRICT,
  discipline_id INTEGER NOT NULL REFERENCES lab10.disciplines(id) ON DELETE RESTRICT,
  teacher_id INTEGER NOT NULL REFERENCES lab10.teachers(id) ON DELETE RESTRICT,
  lesson_type_id INTEGER NOT NULL REFERENCES lab10.lesson_types(id) ON DELETE RESTRICT
);

INSERT INTO lab10.categories (id, title) VALUES
  (1, 'Smartphones'),
  (2, 'Laptops'),
  (3, 'Accessories')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab10.products (id, category_id, title, description, price, amount, image) VALUES
  (1, 1, 'iPhone 15 Pro', 'Compact flagship smartphone with A17 Pro chip and titanium body.', 12000000, 9, ''),
  (2, 1, 'Samsung Galaxy S24', 'Android flagship with bright display and fast camera.', 9500000, 14, ''),
  (3, 2, 'MacBook Air M2', 'Lightweight notebook for study, office work and development.', 11000000, 5, ''),
  (4, 2, 'Lenovo ThinkPad E14', 'Business notebook with durable keyboard and matte screen.', 7600000, 8, ''),
  (5, 3, 'AirPods Pro 2', 'Wireless earbuds with active noise cancellation.', 2400000, 42, ''),
  (6, 3, 'USB-C GaN Charger 65W', 'Small charger for phones, tablets and notebooks.', 350000, 36, ''),
  (7, 3, 'Logitech MX Master 3S', 'Ergonomic wireless mouse for daily work.', 1200000, 18, ''),
  (8, 3, 'Keychron K2 Keyboard', 'Mechanical wireless keyboard for typing and coding.', 950000, 21, '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab10.orders (id, customer_name, customer_phone, created_at) VALUES
  (1, 'Demo Customer', '+7 900 000-00-01', '2026-04-01 10:30:00+03'),
  (2, 'Student Example', '+7 900 000-00-02', '2026-04-02 12:15:00+03')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab10.order_items (order_id, product_id, quantity, price)
SELECT 1, 1, 1, 12000000
WHERE NOT EXISTS (SELECT 1 FROM lab10.order_items WHERE order_id = 1 AND product_id = 1);

INSERT INTO lab10.order_items (order_id, product_id, quantity, price)
SELECT 1, 5, 2, 2400000
WHERE NOT EXISTS (SELECT 1 FROM lab10.order_items WHERE order_id = 1 AND product_id = 5);

INSERT INTO lab10.order_items (order_id, product_id, quantity, price)
SELECT 2, 3, 1, 11000000
WHERE NOT EXISTS (SELECT 1 FROM lab10.order_items WHERE order_id = 2 AND product_id = 3);

INSERT INTO lab10.departments (id, title) VALUES
  (1, 'Кафедра компьютерных наук'),
  (2, 'Кафедра информационных систем')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.positions (id, title) VALUES
  (1, 'Профессор'),
  (2, 'Старший преподаватель'),
  (3, 'Ассистент')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.persons (id, full_name, email) VALUES
  (1, 'Иван Петров', 'petrov@example.edu'),
  (2, 'Анна Смирнова', 'smirnova@example.edu'),
  (3, 'Сергей Иванов', 'ivanov@example.edu')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;

INSERT INTO lab10.teachers (id, person_id, department_id, position_id) VALUES
  (1, 1, 1, 1),
  (2, 2, 2, 2),
  (3, 3, 1, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab10.study_groups (id, title) VALUES
  (1, 'IS-21'),
  (2, 'CS-22'),
  (3, 'WEB-23')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab10.buildings (id, title, address) VALUES
  (1, 'Главный корпус', 'Центральная улица, 1'),
  (2, 'IT-корпус', 'Технический проспект, 10')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, address = EXCLUDED.address;

INSERT INTO lab10.classrooms (id, building_id, title, capacity) VALUES
  (1, 1, '101', 32),
  (2, 1, '203', 24),
  (3, 2, 'Лаборатория 3', 20)
ON CONFLICT (id) DO UPDATE SET building_id = EXCLUDED.building_id, title = EXCLUDED.title, capacity = EXCLUDED.capacity;

INSERT INTO lab10.disciplines (id, title) VALUES
  (1, 'Основы веб-программирования'),
  (2, 'Основы баз данных'),
  (3, 'Основы информационной безопасности')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.lesson_types (id, title) VALUES
  (1, 'Лекция'),
  (2, 'Практика'),
  (3, 'Лабораторная')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.schedule_lessons (id, week, day_of_week, start_time, group_id, classroom_id, discipline_id, teacher_id, lesson_type_id) VALUES
  (1, 1, 1, '09:00', 1, 3, 1, 1, 3),
  (2, 1, 2, '10:40', 2, 1, 2, 2, 1),
  (3, 2, 3, '12:30', 3, 2, 3, 3, 2),
  (4, 2, 5, '14:10', 1, 1, 2, 2, 2)
ON CONFLICT (id) DO NOTHING;

DELETE FROM lab10.schedule_lessons WHERE group_id IN (1, 2, 3);
DELETE FROM lab10.study_groups WHERE id IN (1, 2, 3);

INSERT INTO lab10.departments (id, title) VALUES
  (10, 'Кафедра прикладной информатики')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.positions (id, title) VALUES
  (10, 'Преподаватель')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.study_groups (id, title) VALUES
  (10, 'ПИ2401'),
  (11, 'ПИ2402'),
  (12, 'ПИ2403'),
  (13, 'ПИ2404')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.buildings (id, title, address) VALUES
  (10, 'КубГАУ', 'Расписание группы ПИ2402 с s.kubsau.ru')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, address = EXCLUDED.address;

INSERT INTO lab10.classrooms (id, building_id, title, capacity) VALUES
  (101, 10, '207эк', 0),
  (102, 10, '404эк', 0),
  (103, 10, 'Спортивный комплекс', 0),
  (104, 10, '638гл', 0),
  (105, 10, '407эк', 0),
  (106, 10, '310эк', 0),
  (107, 10, '350зоо / 431зоо', 0),
  (108, 10, '103эк', 0),
  (109, 10, '205эк', 0),
  (110, 10, '101эк', 0),
  (111, 10, '214эк', 0),
  (112, 10, '209эк', 0),
  (113, 10, '13гд', 0),
  (114, 10, '402эк', 0),
  (115, 10, '219гл', 0)
ON CONFLICT (id) DO UPDATE
SET building_id = EXCLUDED.building_id,
    title = EXCLUDED.title,
    capacity = EXCLUDED.capacity;

INSERT INTO lab10.disciplines (id, title) VALUES
  (101, 'Архитектура информационных систем'),
  (102, 'Мультимедиа технологии'),
  (103, 'Элективные курсы по физической культуре и спорту'),
  (104, 'Базы данных'),
  (105, 'Информационная безопасность'),
  (106, 'Исследование операций и методы оптимизации'),
  (107, 'Нечеткие модели принятия решений'),
  (108, 'Иностранный язык'),
  (109, 'Проектирование информационных систем'),
  (110, 'Веб-дизайн и интернет-программирование')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO lab10.persons (id, full_name, email) VALUES
  (101, 'Бакшанская Л. К., Коляда В. В.', ''),
  (102, 'Васильева А. Д., Егорчев Ф. А.', ''),
  (103, 'Евтых С. А., Омельченко М. М., Комбалин М. Н., Бондаренко Н. М., Скалозуб А. Г., Ильин В. В., Молдован В. А., Алешин Е. А., Гетманская Я. Э.', ''),
  (104, 'Ткаченко В. В.', ''),
  (105, 'Алашеев В. В.', ''),
  (106, 'Кудрина И. В.', ''),
  (107, 'Ефанова Н. В., Васильева А. Д.', ''),
  (108, 'Карипиди А. Г., Тапехина Т. Е.', ''),
  (109, 'Попова М. И., Ткаченко В. В.', ''),
  (110, 'Лещенко К. Д., Василенко А. И.', ''),
  (111, 'Ефанова Н. В.', ''),
  (112, 'Замотайлова Д. А.', ''),
  (113, 'Лаптев С. В., Чемарина А. В.', ''),
  (114, 'Вострокнутов А. Е.', ''),
  (115, 'Кондратьев В. Ю.', ''),
  (116, 'Креймер А. С.', ''),
  (117, 'Осенний В. В., Осадчая А. В.', '')
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

INSERT INTO lab10.teachers (id, person_id, department_id, position_id) VALUES
  (101, 101, 10, 10),
  (102, 102, 10, 10),
  (103, 103, 10, 10),
  (104, 104, 10, 10),
  (105, 105, 10, 10),
  (106, 106, 10, 10),
  (107, 107, 10, 10),
  (108, 108, 10, 10),
  (109, 109, 10, 10),
  (110, 110, 10, 10),
  (111, 111, 10, 10),
  (112, 112, 10, 10),
  (113, 113, 10, 10),
  (114, 114, 10, 10),
  (115, 115, 10, 10),
  (116, 116, 10, 10),
  (117, 117, 10, 10)
ON CONFLICT (id) DO UPDATE
SET person_id = EXCLUDED.person_id,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id;

DELETE FROM lab10.schedule_lessons WHERE group_id IN (10, 11, 12, 13);

INSERT INTO lab10.schedule_lessons
  (id, week, day_of_week, start_time, group_id, classroom_id, discipline_id, teacher_id, lesson_type_id)
VALUES
  (101, 1, 1, '08:00', 11, 101, 101, 101, 3),
  (102, 1, 1, '09:45', 11, 102, 102, 102, 3),
  (103, 1, 2, '08:00', 11, 103, 103, 103, 2),
  (104, 1, 2, '09:45', 11, 104, 104, 104, 1),
  (105, 1, 2, '11:30', 11, 105, 105, 105, 1),
  (106, 1, 2, '13:50', 11, 106, 106, 106, 2),
  (107, 1, 3, '08:00', 11, 102, 107, 107, 3),
  (108, 1, 3, '09:45', 11, 107, 108, 108, 3),
  (109, 1, 3, '11:30', 11, 108, 104, 109, 3),
  (110, 1, 3, '13:50', 11, 109, 109, 110, 3),
  (111, 1, 4, '08:00', 11, 103, 103, 103, 2),
  (112, 1, 4, '09:45', 11, 106, 107, 111, 1),
  (113, 1, 4, '11:30', 11, 106, 101, 112, 1),
  (114, 1, 4, '13:50', 11, 110, 110, 113, 3),
  (115, 2, 1, '08:00', 11, 106, 104, 104, 1),
  (116, 2, 1, '09:45', 11, 111, 104, 104, 1),
  (117, 2, 2, '08:00', 11, 106, 102, 114, 1),
  (118, 2, 2, '09:45', 11, 107, 108, 108, 3),
  (119, 2, 2, '11:30', 11, 110, 105, 105, 1),
  (120, 2, 2, '13:50', 11, 112, 101, 101, 3),
  (121, 2, 3, '08:00', 11, 106, 107, 111, 1),
  (122, 2, 3, '09:45', 11, 106, 101, 112, 1),
  (123, 2, 3, '11:30', 11, 113, 109, 115, 1),
  (124, 2, 4, '09:45', 11, 114, 107, 107, 3),
  (125, 2, 4, '11:30', 11, 108, 110, 113, 3),
  (126, 2, 4, '13:50', 11, 106, 106, 106, 2),
  (127, 2, 4, '15:35', 11, 115, 110, 116, 3),
  (128, 2, 5, '09:45', 11, 112, 109, 110, 3),
  (129, 2, 5, '11:30', 11, 111, 106, 117, 3)
ON CONFLICT (id) DO UPDATE
SET week = EXCLUDED.week,
    day_of_week = EXCLUDED.day_of_week,
    start_time = EXCLUDED.start_time,
    group_id = EXCLUDED.group_id,
    classroom_id = EXCLUDED.classroom_id,
    discipline_id = EXCLUDED.discipline_id,
    teacher_id = EXCLUDED.teacher_id,
    lesson_type_id = EXCLUDED.lesson_type_id;

SELECT setval('lab10.categories_id_seq', COALESCE((SELECT MAX(id) FROM lab10.categories), 1), true);
SELECT setval('lab10.products_id_seq', COALESCE((SELECT MAX(id) FROM lab10.products), 1), true);
SELECT setval('lab10.orders_id_seq', COALESCE((SELECT MAX(id) FROM lab10.orders), 1), true);
SELECT setval('lab10.order_items_id_seq', COALESCE((SELECT MAX(id) FROM lab10.order_items), 1), true);
SELECT setval('lab10.departments_id_seq', COALESCE((SELECT MAX(id) FROM lab10.departments), 1), true);
SELECT setval('lab10.positions_id_seq', COALESCE((SELECT MAX(id) FROM lab10.positions), 1), true);
SELECT setval('lab10.persons_id_seq', COALESCE((SELECT MAX(id) FROM lab10.persons), 1), true);
SELECT setval('lab10.teachers_id_seq', COALESCE((SELECT MAX(id) FROM lab10.teachers), 1), true);
SELECT setval('lab10.study_groups_id_seq', COALESCE((SELECT MAX(id) FROM lab10.study_groups), 1), true);
SELECT setval('lab10.buildings_id_seq', COALESCE((SELECT MAX(id) FROM lab10.buildings), 1), true);
SELECT setval('lab10.classrooms_id_seq', COALESCE((SELECT MAX(id) FROM lab10.classrooms), 1), true);
SELECT setval('lab10.disciplines_id_seq', COALESCE((SELECT MAX(id) FROM lab10.disciplines), 1), true);
SELECT setval('lab10.lesson_types_id_seq', COALESCE((SELECT MAX(id) FROM lab10.lesson_types), 1), true);
SELECT setval('lab10.schedule_lessons_id_seq', COALESCE((SELECT MAX(id) FROM lab10.schedule_lessons), 1), true);
