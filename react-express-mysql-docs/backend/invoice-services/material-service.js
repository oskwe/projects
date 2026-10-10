const db = require('../invoice-models');

class MaterialService {
  async getAll() {
    return await db.Material.findAll();
  }

  async getById(id) {
    return await db.Material.findByPk(id);
  }

  async create(data) {
    return await db.Material.create(data);
  }

  async update(id, data) {
    const material = await db.Material.findByPk(id);
    if (!material) return null;
    return await material.update(data);
  }

  async delete(id) {
    const material = await db.Material.findByPk(id);
    if (!material) return false;
    await material.destroy();
    return true;
  }
}

module.exports = new MaterialService();