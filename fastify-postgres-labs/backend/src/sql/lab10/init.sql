CREATE SCHEMA IF NOT EXISTS lab10;

CREATE TABLE lab10.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE lab10.products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES lab10.categories(id),
    image TEXT
);

CREATE TABLE lab10.orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES lab10.products(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab10.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES lab10.orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES lab10.products(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price INTEGER NOT NULL DEFAULT 0
);

INSERT INTO lab10.categories (id, name) VALUES
(1, 'Смартфоны'),
(2, 'Ноутбуки'),
(3, 'Аксессуары'),
(4, 'Периферия');

INSERT INTO lab10.products (title, price, amount, category_id) VALUES
('iPhone 15 Pro Max', 15000000, 5, 1),
('iPhone 15', 8500000, 20, 1),
('iPhone 14', 7000000, 15, 1),
('iPhone 13 mini', 6000000, 8, 1),
('Samsung Galaxy S24 Ultra', 14000000, 7, 1),
('Samsung Galaxy S24+', 9500000, 10, 1),
('Samsung Galaxy S23 FE', 5500000, 25, 1),
('Google Pixel 8 Pro', 9000000, 6, 1),
('Google Pixel 7a', 4500000, 12, 1),
('Xiaomi 14 Ultra', 11000000, 4, 1),
('Xiaomi Redmi Note 13', 2500000, 50, 1),
('Poco X6 Pro', 3200000, 30, 1),
('OnePlus 12', 7500000, 9, 1),
('Nothing Phone (2)', 6000000, 11, 1),
('Sony Xperia 1 V', 11500000, 3, 1),
('ASUS Zenfone 10', 7200000, 5, 1),
('MacBook Pro 16 M3 Max', 35000000, 2, 2),
('MacBook Pro 14 M3', 18000000, 5, 2),
('MacBook Air 15 M2', 13000000, 8, 2),
('MacBook Air 13 M1', 8500000, 15, 2),
('ASUS ROG Strix Scar 18', 32000000, 3, 2),
('ASUS Zenbook 14 OLED', 11000000, 7, 2),
('ASUS TUF Gaming A15', 9500000, 12, 2),
('Lenovo Legion Pro 7', 28000000, 4, 2),
('Lenovo ThinkPad X1 Carbon', 21000000, 6, 2),
('Lenovo IdeaPad Slim 3', 4500000, 30, 2),
('Dell XPS 13 Plus', 19000000, 5, 2),
('HP Spectre x360', 16000000, 4, 2),
('MSI Raider GE78', 29000000, 3, 2),
('Acer Swift Go 14', 8000000, 10, 2),
('Huawei MateBook X Pro', 14500000, 6, 2),
('Apple AirPods Pro 2', 2400000, 40, 3),
('Apple AirPods 3', 1700000, 35, 3),
('Sony WH-1000XM5', 3500000, 15, 3),
('Sony WF-1000XM5', 2800000, 20, 3),
('Marshall Major IV', 1300000, 25, 3),
('JBL Flip 6', 1100000, 50, 3),
('Яндекс Станция Макс', 3000000, 10, 3),
('Apple Watch Ultra 2', 8500000, 5, 3),
('Apple Watch Series 9', 4500000, 12, 3),
('Samsung Galaxy Watch 6', 2800000, 15, 3),
('Xiaomi Smart Band 8', 350000, 100, 3),
('Anker PowerBank 737', 1200000, 15, 3),
('Baseus Charger 65W', 300000, 60, 3),
('Кабель Ugreen USB-C', 80000, 200, 3),
('Apple AirTag', 350000, 50, 3),
('Logitech MX Master 3S', 1100000, 20, 4),
('Logitech G Pro X Superlight', 1400000, 15, 4),
('Razer DeathAdder V3', 1300000, 10, 4),
('Keychron K2 Pro', 1200000, 12, 4),
('NuPhy Air75 v2', 1500000, 8, 4),
('Logitech MX Keys S', 1150000, 15, 4),
('Монитор Dell UltraSharp 27', 5500000, 5, 4),
('Монитор LG UltraGear 32', 4200000, 8, 4),
('Монитор Xiaomi Curved 34', 3000000, 10, 4),
('Веб-камера Logitech C920', 800000, 25, 4),
('Веб-камера Razer Kiyo Pro', 1500000, 10, 4),
('Микрофон Blue Yeti', 1400000, 12, 4),
('Микрофон HyperX QuadCast', 1600000, 8, 4),
('Elgato Stream Deck MK.2', 1800000, 6, 4),
('Карта захвата AverMedia', 2000000, 4, 4);
