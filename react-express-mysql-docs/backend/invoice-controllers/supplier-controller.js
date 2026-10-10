const SupplierService = require('../invoice-services/supplier-service');

class SupplierController {

  async getAllRecords(req, res) {
    try {
      const suppliers = await SupplierService.getAll();
      return res.json(suppliers);
    } catch (error) {
      console.error('Ошибка при получении поставщиков:', error);
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  async getOneRecord(req, res) {
    try {
      const supplier = await SupplierService.getById(req.params.id);
      return res.json(supplier);
    } catch (error) {
      console.error(`Ошибка при получении поставщика ${req.params.id}:`, error);
      if (error.message === 'Поставщик не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  async createRecord(req, res) {
    try {
      const newSupplier = await SupplierService.create(req.body);
      return res.status(201).json(newSupplier);
    } catch (error) {
      console.error('Ошибка при создании поставщика:', error);
      return res.status(400).json({ message: 'Ошибка создания', error: error.message });
    }
  }

  async updateRecord(req, res) {
    try {
      const updatedSupplier = await SupplierService.update(req.body.id, req.body);
      return res.json(updatedSupplier);
    } catch (error) {
      console.error('Ошибка при обновлении поставщика:', error);
      if (error.message === 'Поставщик не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: 'Ошибка обновления', error: error.message });
    }
  }

  async removeRecord(req, res) {
    try {
      await SupplierService.delete(req.params.id);
      return res.json({ message: 'Поставщик успешно удалён' });
    } catch (error) {
      console.error(`Ошибка при удалении поставщика ${req.params.id}:`, error);
      if (error.message === 'Поставщик не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }
}

module.exports = new SupplierController();