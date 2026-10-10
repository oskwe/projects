# Backend на Node.js: Fastify + PostgreSQL

> **Стек:** Node.js · Fastify 5 · PostgreSQL 16 · JWT (@fastify/jwt) · bcrypt · Docker Compose

Лабораторные работы № 7–12 по серверной веб-разработке. Каждая работа — отдельный набор маршрутов, сервисов и страниц.

| Лаба | Что сделано |
|---|---|
| 7 | Первые маршруты Fastify, обработка запросов |
| 8 | Работа с файлами и JSON (данные ЧМ-2022), валидация по JSON Schema |
| 9 | CRUD товаров в PostgreSQL |
| 10 | Магазин и расписание: связанные таблицы, сложные SQL-запросы |
| 11 | Регистрация и вход: bcrypt-хеширование паролей, JWT, защищённые маршруты |
| 12 | Серверная валидация данных |

## Структура

```
backend/
  server.js        — точка входа, регистрация плагинов и маршрутов
  src/routes/      — маршруты по лабораторным
  src/services/    — работа с БД и бизнес-логика
  src/sql/, db/init — схемы и начальные данные
public/            — клиентские страницы к каждой лабораторной
```

## Запуск

```bash
cp backend/.env.example backend/.env.local
docker compose -f docker-compose.local.yml up --build
```

Приложение: http://localhost:3000, Adminer: http://localhost:8080.
