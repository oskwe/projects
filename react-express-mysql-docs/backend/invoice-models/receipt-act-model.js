const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // или connection2.js

const ReceiptAct = sequelize.define('ReceiptAct', {
  act_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  act_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.STRING(255)
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'receipt_acts',
  timestamps: false
});

// Ассоциации
ReceiptAct.associate = function(models) {
  ReceiptAct.belongsTo(models.Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
  ReceiptAct.hasMany(models.ReceiptActItem, { foreignKey: 'act_id', as: 'items' });
};

module.exports = ReceiptAct;