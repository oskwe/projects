const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ReceiptActItem = sequelize.define('ReceiptActItem', {
  act_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'receipt_acts',
      key: 'id'
    }
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'materials',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 3),
    allowNull: false,
    validate: { min: 0.001 }
  },
  price_per_unit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 0 }
  }
}, {
  tableName: 'receipt_act_items',
  timestamps: false
});

// Ассоциации
ReceiptActItem.associate = function(models) {
  ReceiptActItem.belongsTo(models.ReceiptAct, { foreignKey: 'act_id', as: 'act' });
  ReceiptActItem.belongsTo(models.Material, { foreignKey: 'material_id', as: 'material' });
};

module.exports = ReceiptActItem;