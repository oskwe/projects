const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Supplier = sequelize.define('Supplier', {
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contact_info: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'suppliers',
  timestamps: false
});

Supplier.associate = function(models) {
  Supplier.hasMany(models.ReceiptAct, { foreignKey: 'supplier_id', as: 'acts' });
};

module.exports = Supplier;