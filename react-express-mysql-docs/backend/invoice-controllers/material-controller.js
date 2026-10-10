const MaterialService = require('../invoice-services/material-service');

class MaterialController {

  async getAllRecords(req, res) {
    try {
      const materials = await MaterialService.getAll();
      return res.json(materials);
    } catch (error) {
      console.error('Ошибка при получении материалов:', error);
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  async getOneRecord(req, res) {
    try {
      const material = await MaterialService.getById(req.params.id);
      return res.json(material);
    } catch (error) {
      console.error(`Ошибка при получении материала ${req.params.id}:`, error);
      if (error.message === 'Материал не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  async createRecord(req, res) {
    try {
      const newMaterial = await MaterialService.create(req.body);
      return res.status(201).json(newMaterial);
    } catch (error) {
      console.error('Ошибка при создании материала:', error);
      return res.status(400).json({ message: 'Ошибка создания', error: error.message });
    }
  }

  async updateRecord(req, res) {
    try {
      const updatedMaterial = await MaterialService.update(req.body.id, req.body);
      return res.json(updatedMaterial);
    } catch (error) {
      console.error('Ошибка при обновлении материала:', error);
      if (error.message === 'Материал не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: 'Ошибка обновления', error: error.message });
    }
  }

  async removeRecord(req, res) {
    try {
      await MaterialService.delete(req.params.id);
      return res.json({ message: 'Материал успешно удалён' });
    } catch (error) {
      console.error(`Ошибка при удалении материала ${req.params.id}:`, error);
      if (error.message === 'Материал не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }
}

module.exports = new MaterialController();