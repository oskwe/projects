const db = require('../invoice-models');

class SupplierService {
  async getAll() {
    return await db.Supplier.findAll();
  }

  async getById(id) {
    return await db.Supplier.findByPk(id);
  }

  async create(data) {
    return await db.Supplier.create(data);
  }

  async update(id, data) {
    const supplier = await db.Supplier.findByPk(id);
    if (!supplier) return null;
    return await supplier.update(data);
  }

  async delete(id) {
    const supplier = await db.Supplier.findByPk(id);
    if (!supplier) return false;
    await supplier.destroy();
    return true;
  }
}

module.exports = new SupplierService();