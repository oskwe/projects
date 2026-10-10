const new_Sequelize = require('sequelize');

//**  Подключение к БД  **//
const new_sequelize = new new_Sequelize(
    'invoice', // название Базы Данных
    process.env.DB_USER || 'root', // Пользователь Базы Данных
    process.env.DB_PASSWORD || '', // Пароль (задаётся через переменную окружения)
    {
        host: process.env.DB_HOST || 'localhost', // Адрес сервера БД
        dialect: 'mysql', // Название сервера БД

    }
);

// Экспорт экземпляра подключения
// Нужен для использования в других файлах
module.exports = new_sequelize;
