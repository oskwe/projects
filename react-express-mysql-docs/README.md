# Веб-интерфейс документов «Доверенность» и «Счёт-фактура»

> **Стек:** React 18 · Ant Design 5 · React Router · Axios · Node.js · Express · Sequelize · MySQL

Учебное full-stack приложение: справочники (организации, физлица, товары, контрагенты, материальные ценности) и два документа с шапкой и табличной частью. Документы можно распечатать прямо из браузера (react-to-print).

## Структура

```
backend/    Express + Sequelize
  models/, invoice-models/          — модели таблиц
  services/, invoice-services/      — бизнес-логика
  controllers/, invoice-controllers/ — обработчики запросов
  routers/                          — REST API, префикс /api
frontend/   React (Create React App)
  src/views, src/invoice-views      — страницы
  src/components                    — диалоги создания и редактирования
  src/api                           — запросы к API
```

## Запуск

Нужны Node.js 18+ и MySQL с базами `proxy` и `invoice`.

```bash
cd backend
npm install
DB_USER=root DB_PASSWORD=ваш_пароль npm start   # http://localhost:8080/api

cd ../frontend
npm install
npm start                                        # http://localhost:3000
```
