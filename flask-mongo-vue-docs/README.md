# Документооборот: доверенность и товарная накладная ТОРГ-12

> **Стек:** Python · Flask · MongoDB (PyMongo) · Vue 3 · Vuex · Vue Router · Bootstrap 5

Учебное SPA-приложение для ведения документов «Доверенность» и «Товарная накладная (ТОРГ-12)» со справочниками: организации, физические лица, должности, товары, единицы измерения, виды упаковки и документы-основания. Накладную можно распечатать.

## Архитектура backend

REST API на Flask разделён на слои:

```
routes/        — маршруты (Blueprint), префикс /api
controllers/   — разбор запроса и формирование ответа
services/      — бизнес-логика и валидация
repositories/  — работа с коллекциями MongoDB
utils/         — подключение к БД, JSON-энкодер для ObjectId, обработка ошибок
```

Frontend — Vue 3: Vuex хранит состояние и выполняет запросы к API, Vue Router отвечает за навигацию, формы и таблицы вынесены в отдельные компоненты.

## Запуск

Нужны Python 3.10+, Node.js 18+ и MongoDB на `localhost:27017`.

```bash
# backend
cd backend
python -m venv venv
venv\Scripts\activate          # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python main.py                 # http://localhost:5000

# frontend
cd frontend
npm install
npm run serve                  # http://localhost:8080
```

Тестовые данные для импорта лежат в папке `MONGODB/`.
