UPDATE lab10.persons SET first_name = 'Кирилл', middle_name = 'Денисович' WHERE last_name = 'Лещенко';
UPDATE lab10.persons SET first_name = 'Лада', middle_name = 'Константиновна' WHERE last_name = 'Бакшанская';
UPDATE lab10.persons SET first_name = 'Валентина', middle_name = 'Владимировна' WHERE last_name = 'Коляда';
UPDATE lab10.persons SET first_name = 'Вадим', middle_name = 'Викторович' WHERE last_name = 'Алашеев';
UPDATE lab10.persons SET first_name = 'Саида', middle_name = 'Адамовна' WHERE last_name = 'Евтых';
UPDATE lab10.persons SET first_name = 'Максим', middle_name = 'Николаевич' WHERE last_name = 'Комбалин';
UPDATE lab10.persons SET first_name = 'Надежда', middle_name = 'Михайловна' WHERE last_name = 'Бондаренко';
UPDATE lab10.persons SET first_name = 'Анастасия', middle_name = 'Григорьевна' WHERE last_name = 'Скалозуб';
UPDATE lab10.persons SET first_name = 'Владимир', middle_name = 'Викторович' WHERE last_name = 'Ильин';
UPDATE lab10.persons SET first_name = 'Виталий', middle_name = 'Андреевич' WHERE last_name = 'Молдован';
UPDATE lab10.persons SET first_name = 'Егор', middle_name = 'Андреевич' WHERE last_name = 'Алешин';
UPDATE lab10.persons SET last_name = 'Гетманская', first_name = 'Яна', middle_name = 'Эрнестовна' WHERE last_name = 'Тетянская';
UPDATE lab10.persons SET first_name = 'Василий', middle_name = 'Владимирович' WHERE last_name = 'Ткаченко';
UPDATE lab10.persons SET first_name = 'Ирина', middle_name = 'Викторовна' WHERE last_name = 'Кудрина';
UPDATE lab10.persons SET first_name = 'Анастасия', middle_name = 'Викторовна' WHERE last_name = 'Осадчая';
UPDATE lab10.persons SET first_name = 'Игорь', middle_name = 'Викторович' WHERE last_name = 'Яткин';
UPDATE lab10.persons SET first_name = 'Елена', middle_name = 'Витальевна' WHERE last_name = 'Попова';
UPDATE lab10.persons SET first_name = 'Анна', middle_name = 'Валерьевна' WHERE last_name = 'Чемарина';
UPDATE lab10.persons SET first_name = 'Алексей', middle_name = 'Семёнович' WHERE last_name = 'Креймер';
UPDATE lab10.persons SET first_name = 'Валерий', middle_name = 'Юрьевич' WHERE last_name = 'Кондратьев';

UPDATE lab10.schedule_entries
SET notes = REPLACE(notes, 'Комбалин Н. Н.', 'Комбалин М. Н.');

UPDATE lab10.schedule_entries
SET notes = REPLACE(notes, 'Тетянская Я. Э.', 'Гетманская Я. Э.');
