CREATE SCHEMA IF NOT EXISTS lab9;

CREATE TABLE IF NOT EXISTS lab9.products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
  image TEXT
);

INSERT INTO lab9.products (title, price, amount)
SELECT title, price, amount
FROM (
  VALUES
    ('iPhone 15 Pro', 12000000, 10),
    ('Samsung Galaxy S24', 9500000, 15),
    ('MacBook Air M2', 11000000, 5),
    ('AirPods Pro 2', 2400000, 50),
    ('Sony WH-1000XM5', 3500000, 20),
    ('Xiaomi Power Bank', 250000, 100),
    ('Logitech MX Master 3S', 1200000, 30),
    ('Keychron K2 Keyboard', 950000, 25),
    ('Dell UltraSharp 27"', 4500000, 8),
    (U&'\041A\0430\0431\0435\043B\044C USB-C 1m', 50000, 200),
    (U&'\0417\0430\0440\044F\0434\043A\0430 GaN 65W', 350000, 40),
    ('iPad Air 5', 6000000, 12),
    ('Apple Pencil 2', 1200000, 30),
    (U&'\0427\0435\0445\043E\043B \0434\043B\044F iPhone', 150000, 150),
    (U&'\0417\0430\0449\0438\0442\043D\043E\0435 \0441\0442\0435\043A\043B\043E', 80000, 300)
) AS seed(title, price, amount)
WHERE NOT EXISTS (SELECT 1 FROM lab9.products);
