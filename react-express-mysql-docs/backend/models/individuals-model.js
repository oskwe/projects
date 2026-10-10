const Sequelize = require('sequelize');
const sequelize = require('../connection');


const IndividualsModel = sequelize.define(
    'individuals',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        firstName: {
            type: Sequelize.STRING(25),
            allowNull: false,
        },
        lastName: {
            type: Sequelize.STRING(25),
            allowNull: false,
        },
        patronymic: {
            type: Sequelize.STRING(25),
            allowNull: true,
            default: null,
        },
        issued: {
            type: Sequelize.STRING(80),
            allowNull: true,
        },
        series: {
            type: Sequelize.STRING(4),
            allowNull: true,
        },
        number: {
            type: Sequelize.STRING(6),
            allowNull: true,
        }
    },
    {
        timestamps: false,
    }
);

module.exports = IndividualsModel;