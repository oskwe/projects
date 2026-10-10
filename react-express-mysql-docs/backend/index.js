/**  Подключение зависимостей  */
const express = require('express');
const cors = require('cors');
const sequelize = require('./connection.js');
const new_sequelize = require('./connection2.js');
const router = require('./routers/router.js');

const PORT = 8080;
/**  Экземпляр приложения  */
const app = express();

/**  Подключение middlewares  */
app.use(express.json());
app.use(cors());
app.use('/api', router);

console.log('Application starting...');

//**  Проверка подключения к БД (опционально) **//
const assertDatabaseConnectionOk = async () => {
    try {
        console.log(`Checking database connections...`);
        await sequelize.authenticate();
        console.log('Connection to database "proxy" OK!');
        await new_sequelize.authenticate();
        console.log('Connection to database "invoice" OK!');
    } catch (error) {
        console.log('Database connection error (non-critical):', error.message);
    }
}

/**  Функция старта приложения  */
const start = async () => {
    try {
        await assertDatabaseConnectionOk();
        app.listen(PORT, () => {
            console.log(`Server run on port - ${PORT}`);
            console.log(`API доступно по адресу: http://localhost:${PORT}/api`);
        });
    } catch (e) {
        console.log('Startup error:', e);
    }
}

start();