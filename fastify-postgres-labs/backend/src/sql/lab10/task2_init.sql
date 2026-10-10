CREATE TABLE IF NOT EXISTS lab10.departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    short_name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.persons (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    middle_name VARCHAR(120) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS lab10.teachers (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES lab10.persons(id) ON DELETE RESTRICT,
    department_id INTEGER NOT NULL REFERENCES lab10.departments(id) ON DELETE RESTRICT,
    position_id INTEGER NOT NULL REFERENCES lab10.positions(id) ON DELETE RESTRICT,
    UNIQUE(person_id)
);

CREATE TABLE IF NOT EXISTS lab10.buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS lab10.rooms (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES lab10.buildings(id) ON DELETE RESTRICT,
    name VARCHAR(120) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0),
    UNIQUE(building_id, name)
);

CREATE TABLE IF NOT EXISTS lab10.disciplines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    short_name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    course INTEGER NOT NULL CHECK (course > 0),
    faculty VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS lab10.lesson_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS lab10.schedule_entries (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL CHECK (week_number > 0),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    lesson_number INTEGER NOT NULL CHECK (lesson_number > 0),
    starts_at TIME NOT NULL,
    ends_at TIME NOT NULL,
    group_id INTEGER NOT NULL REFERENCES lab10.groups(id) ON DELETE RESTRICT,
    discipline_id INTEGER NOT NULL REFERENCES lab10.disciplines(id) ON DELETE RESTRICT,
    teacher_id INTEGER NOT NULL REFERENCES lab10.teachers(id) ON DELETE RESTRICT,
    room_id INTEGER NOT NULL REFERENCES lab10.rooms(id) ON DELETE RESTRICT,
    lesson_type_id INTEGER NOT NULL REFERENCES lab10.lesson_types(id) ON DELETE RESTRICT,
    notes TEXT NOT NULL DEFAULT ''
);

INSERT INTO lab10.departments (name, short_name)
SELECT seed.name, seed.short_name
FROM (
    VALUES
        ('Кафедра информационных систем', 'КИС'),
        ('Кафедра прикладной математики', 'КПМ'),
        ('Кафедра гуманитарных дисциплин', 'КГД'),
        ('Кафедра физического воспитания', 'КФВ')
) AS seed(name, short_name)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.departments
);

INSERT INTO lab10.positions (name)
SELECT seed.name
FROM (
    VALUES
        ('Доцент'),
        ('Старший преподаватель'),
        ('Ассистент')
) AS seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.positions
);

INSERT INTO lab10.persons (last_name, first_name, middle_name)
SELECT seed.last_name, seed.first_name, seed.middle_name
FROM (
    VALUES
        ('Лещенко', 'Кирилл', 'Денисович'),
        ('Василенко', 'Андрей', 'Игоревич'),
        ('Бакшанская', 'Лада', 'Константиновна'),
        ('Коляда', 'Валентина', 'Владимировна'),
        ('Алашеев', 'Вадим', 'Викторович'),
        ('Евтых', 'Саида', 'Адамовна'),
        ('Омельченко', 'Михаил', 'Михайлович'),
        ('Комбалин', 'Максим', 'Николаевич'),
        ('Бондаренко', 'Надежда', 'Михайловна'),
        ('Скалозуб', 'Анастасия', 'Григорьевна'),
        ('Ильин', 'Владимир', 'Викторович'),
        ('Молдован', 'Виталий', 'Андреевич'),
        ('Алешин', 'Егор', 'Андреевич'),
        ('Гетманская', 'Яна', 'Эрнестовна'),
        ('Ткаченко', 'Василий', 'Владимирович'),
        ('Кудрина', 'Ирина', 'Викторовна'),
        ('Осадчая', 'Анастасия', 'Викторовна'),
        ('Яткин', 'Игорь', 'Викторович'),
        ('Попова', 'Елена', 'Витальевна'),
        ('Еванова', 'Надежда', 'Владимировна'),
        ('Васильева', 'Анна', 'Дмитриевна'),
        ('Талехина', 'Татьяна', 'Евгеньевна'),
        ('Замотайлова', 'Дарья', 'Алексеевна'),
        ('Лаптев', 'Сергей', 'Владимирович'),
        ('Чемарина', 'Анна', 'Валерьевна'),
        ('Креймер', 'Алексей', 'Семёнович'),
        ('Кондратьев', 'Валерий', 'Юрьевич')
) AS seed(last_name, first_name, middle_name)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.persons
);

INSERT INTO lab10.teachers (person_id, department_id, position_id)
SELECT seed.person_id, seed.department_id, seed.position_id
FROM (
    VALUES
        (1, 1, 1),
        (2, 1, 1),
        (3, 1, 1),
        (4, 1, 1),
        (5, 1, 2),
        (6, 4, 2),
        (7, 4, 2),
        (8, 4, 2),
        (9, 4, 2),
        (10, 4, 2),
        (11, 4, 2),
        (12, 4, 2),
        (13, 4, 2),
        (14, 4, 2),
        (15, 1, 1),
        (16, 2, 1),
        (17, 2, 2),
        (18, 3, 2),
        (19, 1, 2),
        (20, 2, 1),
        (21, 2, 2),
        (22, 3, 2),
        (23, 1, 1),
        (24, 1, 2),
        (25, 1, 2),
        (26, 1, 1),
        (27, 1, 1)
) AS seed(person_id, department_id, position_id)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.teachers
);

INSERT INTO lab10.buildings (name, code, address)
SELECT seed.name, seed.code, seed.address
FROM (
    VALUES
        ('Учебный корпус ЭК', 'эк', 'Экономический корпус'),
        ('Главный корпус', 'гл', 'Главный корпус университета'),
        ('Корпус ЗОО', 'зоо', 'Корпус ЗОО'),
        ('Корпус ГД', 'гд', 'Корпус ГД'),
        ('Спортивный комплекс', 'спорт', 'Спортивный комплекс')
) AS seed(name, code, address)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.buildings
);

INSERT INTO lab10.rooms (building_id, name, capacity)
SELECT seed.building_id, seed.name, seed.capacity
FROM (
    VALUES
        (1, '101', 40),
        (1, '103', 40),
        (1, '108', 35),
        (1, '205', 30),
        (1, '207', 30),
        (1, '209', 30),
        (1, '212', 30),
        (1, '216', 30),
        (1, '310', 80),
        (1, '404', 40),
        (2, '219', 60),
        (2, '629', 30),
        (2, '638', 80),
        (3, '431', 25),
        (4, '17', 50),
        (5, 'Комплекс', 120)
) AS seed(building_id, name, capacity)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.rooms
);

INSERT INTO lab10.disciplines (name, short_name)
SELECT seed.name, seed.short_name
FROM (
    VALUES
        ('Проектирование информационных систем', 'ПИС'),
        ('Архитектура информационных систем', 'АИС'),
        ('Информационная безопасность', 'ИБ'),
        ('Элективные курсы по физической культуре и спорту', 'ФКиС'),
        ('Базы данных', 'БД'),
        ('Исследование операций и методы оптимизации', 'ИОиМО'),
        ('Иностранный язык', 'ИЯ'),
        ('Нечеткие модели принятия решений', 'НМПР'),
        ('Веб-дизайн и интернет-программирование', 'ВДиИП'),
        ('Мультимедиа технологии', 'МТ')
) AS seed(name, short_name)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.disciplines
);

INSERT INTO lab10.groups (name, course, faculty)
SELECT seed.name, seed.course, seed.faculty
FROM (
    VALUES
        ('ПИ2401/1', 2, 'Факультет информационных технологий'),
        ('ПИ2401/2', 2, 'Факультет информационных технологий')
) AS seed(name, course, faculty)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.groups
);

INSERT INTO lab10.lesson_types (name)
SELECT seed.name
FROM (
    VALUES
        ('Лекция'),
        ('Практика')
) AS seed(name)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.lesson_types
);

INSERT INTO lab10.schedule_entries (
    week_number,
    day_of_week,
    lesson_number,
    starts_at,
    ends_at,
    group_id,
    discipline_id,
    teacher_id,
    room_id,
    lesson_type_id,
    notes
)
SELECT
    seed.week_number,
    seed.day_of_week,
    seed.lesson_number,
    seed.starts_at::time,
    seed.ends_at::time,
    seed.group_id,
    seed.discipline_id,
    seed.teacher_id,
    seed.room_id,
    seed.lesson_type_id,
    seed.notes
FROM (
    VALUES
        (1, 1, 1, '08:00', '09:30', 1, 1, 2, 6, 2, ''),
        (1, 1, 1, '08:00', '09:30', 2, 1, 1, 6, 2, ''),
        (1, 1, 2, '09:45', '11:15', 1, 2, 3, 5, 2, ''),
        (1, 1, 2, '09:45', '11:15', 2, 2, 4, 5, 2, ''),
        (1, 1, 3, '11:30', '13:00', 1, 3, 5, 1, 2, ''),
        (1, 1, 3, '11:30', '13:00', 2, 3, 5, 1, 2, ''),

        (1, 2, 1, '08:00', '09:30', 1, 4, 6, 16, 2, 'Секция спортивного комплекса'),
        (1, 2, 1, '08:00', '09:30', 2, 4, 7, 16, 2, 'Доп. преподаватели: Комбалин М. Н., Бондаренко Н. М., Скалозуб А. Г., Ильин В. В., Молдован В. А., Алешин Е. А., Гетманская Я. Э.'),
        (1, 2, 2, '09:45', '11:15', 1, 5, 15, 13, 1, ''),
        (1, 2, 2, '09:45', '11:15', 2, 5, 15, 13, 1, ''),
        (1, 2, 3, '11:30', '13:00', 1, 6, 16, 8, 2, ''),
        (1, 2, 3, '11:30', '13:00', 2, 6, 17, 8, 2, ''),
        (1, 2, 4, '13:50', '15:20', 1, 6, 16, 9, 1, ''),
        (1, 2, 4, '13:50', '15:20', 2, 6, 16, 9, 1, ''),

        (1, 3, 1, '08:00', '09:30', 1, 7, 18, 12, 2, ''),
        (1, 3, 2, '09:45', '11:15', 1, 5, 15, 2, 2, ''),
        (1, 3, 2, '09:45', '11:15', 2, 5, 19, 2, 2, ''),
        (1, 3, 3, '11:30', '13:00', 1, 8, 21, 10, 2, ''),
        (1, 3, 3, '11:30', '13:00', 2, 8, 20, 10, 2, ''),
        (1, 3, 4, '13:50', '15:20', 2, 7, 22, 14, 2, ''),

        (1, 4, 1, '08:00', '09:30', 1, 4, 6, 16, 2, 'Секция спортивного комплекса'),
        (1, 4, 1, '08:00', '09:30', 2, 4, 7, 16, 2, 'Доп. преподаватели: Комбалин М. Н., Бондаренко Н. М., Скалозуб А. Г., Ильин В. В., Молдован В. А., Алешин Е. А., Гетманская Я. Э.'),
        (1, 4, 2, '09:45', '11:15', 1, 8, 20, 9, 1, ''),
        (1, 4, 2, '09:45', '11:15', 2, 8, 20, 9, 1, ''),
        (1, 4, 3, '11:30', '13:00', 1, 2, 23, 9, 1, ''),
        (1, 4, 3, '11:30', '13:00', 2, 2, 23, 9, 1, ''),

        (1, 5, 1, '08:00', '09:30', 1, 9, 24, 3, 2, ''),
        (1, 5, 1, '08:00', '09:30', 2, 9, 25, 3, 2, ''),
        (1, 5, 2, '09:45', '11:15', 1, 10, 21, 10, 2, ''),
        (1, 5, 2, '09:45', '11:15', 2, 10, 21, 10, 2, ''),
        (1, 5, 3, '11:30', '13:00', 1, 9, 26, 11, 1, ''),
        (1, 5, 3, '11:30', '13:00', 2, 9, 26, 11, 1, ''),

        (2, 1, 1, '08:00', '09:30', 1, 5, 15, 9, 1, ''),
        (2, 1, 1, '08:00', '09:30', 2, 5, 15, 9, 1, ''),
        (2, 1, 2, '09:45', '11:15', 1, 2, 3, 4, 2, ''),
        (2, 1, 2, '09:45', '11:15', 2, 2, 4, 4, 2, ''),
        (2, 1, 3, '11:30', '13:00', 1, 1, 2, 7, 2, ''),
        (2, 1, 3, '11:30', '13:00', 2, 1, 1, 7, 2, ''),

        (2, 3, 1, '08:00', '09:30', 1, 9, 26, 11, 1, ''),
        (2, 3, 1, '08:00', '09:30', 2, 9, 26, 11, 1, ''),
        (2, 3, 2, '09:45', '11:15', 1, 2, 23, 9, 1, ''),
        (2, 3, 2, '09:45', '11:15', 2, 2, 23, 9, 1, ''),
        (2, 3, 3, '11:30', '13:00', 1, 4, 6, 16, 2, 'Секция спортивного комплекса'),
        (2, 3, 3, '11:30', '13:00', 2, 4, 7, 16, 2, 'Доп. преподаватели: Комбалин М. Н., Бондаренко Н. М., Скалозуб А. Г., Ильин В. В., Молдован В. А., Алешин Е. А., Гетманская Я. Э.'),
        (2, 3, 4, '13:50', '15:20', 1, 1, 27, 15, 1, ''),
        (2, 3, 4, '13:50', '15:20', 2, 1, 27, 15, 1, ''),

        (2, 4, 2, '09:45', '11:15', 1, 9, 24, 2, 2, ''),
        (2, 4, 2, '09:45', '11:15', 2, 9, 25, 2, 2, ''),
        (2, 4, 3, '11:30', '13:00', 1, 6, 16, 8, 2, ''),
        (2, 4, 3, '11:30', '13:00', 2, 6, 17, 8, 2, ''),
        (2, 4, 4, '13:50', '15:20', 1, 6, 16, 9, 1, ''),
        (2, 4, 4, '13:50', '15:20', 2, 6, 16, 9, 1, ''),

        (2, 5, 2, '09:45', '11:15', 2, 8, 21, 5, 2, ''),
        (2, 5, 3, '11:30', '13:00', 1, 7, 22, 14, 2, ''),
        (2, 5, 3, '11:30', '13:00', 2, 7, 18, 12, 2, '')
) AS seed(
    week_number,
    day_of_week,
    lesson_number,
    starts_at,
    ends_at,
    group_id,
    discipline_id,
    teacher_id,
    room_id,
    lesson_type_id,
    notes
)
WHERE NOT EXISTS (
    SELECT 1 FROM lab10.schedule_entries
);
