const Sequelize = require('sequelize');
const sequelize = require('../connection');

const ProxyBodyModel = sequelize.define(
    'proxybody',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        count: {
            type: Sequelize.INTEGER,
            allowNull: true,
            default: 1,
        },
        unit: {
            type: Sequelize.STRING(8),
            allowNull: false,
        },
        proxyHeaderId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            foreignKey: true,
        },
        productId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            foreignKey: true,
        },
    },
    {
        timestamps: false,
    },
);

module.exports = ProxyBodyModel;