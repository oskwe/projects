const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Material = sequelize.define('Material', {
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'materials',
  timestamps: false
});

Material.associate = function(models) {
  Material.hasMany(models.ReceiptActItem, { foreignKey: 'material_id', as: 'items' });
};

module.exports = Material;