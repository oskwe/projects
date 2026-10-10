const db = require('../invoice-models');

class ReceiptActItemService {
  async getByActId(receiptActId) {
    return await db.ReceiptActItem.findAll({
      where: { receiptActId },
      include: [{ model: db.Material, as: 'material' }]
    });
  }

  async getById(id) {
    return await db.ReceiptActItem.findByPk(id, {
      include: [{ model: db.Material, as: 'material' }]
    });
  }

  async create(data) {
    const total = (parseFloat(data.quantity) || 0) * (parseFloat(data.price) || 0);
    data.total = total;
    return await db.ReceiptActItem.create(data);
  }

  async update(id, data) {
    const item = await db.ReceiptActItem.findByPk(id);
    if (!item) return null;
    
    if ((data.quantity !== undefined || data.price !== undefined) && !data.total) {
      const quantity = data.quantity !== undefined ? data.quantity : item.quantity;
      const price = data.price !== undefined ? data.price : item.price;
      data.total = parseFloat(quantity) * parseFloat(price);
    }
    
    return await item.update(data);
  }

  async delete(id) {
    const item = await db.ReceiptActItem.findByPk(id);
    if (!item) return false;
    await item.destroy();
    return true;
  }
}

module.exports = new ReceiptActItemService();