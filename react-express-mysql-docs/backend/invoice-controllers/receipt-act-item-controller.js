const ReceiptActItemService = require('../invoice-services/receipt-act-item-service');

class ReceiptActItemController {

  // GET /receipt-act-items/by-act/:actId — получить все позиции по ID акта
  async getAllHeadersRecords(req, res) {
    try {
      const items = await ReceiptActItemService.getAllByActId(req.params.headerId); // ← обратите внимание: headerId = actId
      return res.json(items);
    } catch (error) {
      console.error(`Ошибка при получении позиций акта ${req.params.headerId}:`, error);
      return res.status(404).json({ message: error.message });
    }
  }

  // GET /receipt-act-items/:id — получить одну позицию
  async getOneRecord(req, res) {
    try {
      const item = await ReceiptActItemService.getById(req.params.id);
      return res.json(item);
    } catch (error) {
      console.error(`Ошибка при получении позиции ${req.params.id}:`, error);
      if (error.message === 'Позиция не найдена') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  // POST /receipt-act-items — создать новую позицию
  async createRecord(req, res) {
    try {
      const newItem = await ReceiptActItemService.create(req.body);
      return res.status(201).json(newItem);
    } catch (error) {
      console.error('Ошибка при создании позиции:', error);
      return res.status(400).json({ message: 'Ошибка создания', error: error.message });
    }
  }

  // PUT /receipt-act-items/:id — обновить позицию
  async updateRecord(req, res) {
    try {
      const updatedItem = await ReceiptActItemService.update(req.params.id, req.body);
      return res.json(updatedItem);
    } catch (error) {
      console.error(`Ошибка при обновлении позиции ${req.params.id}:`, error);
      if (error.message === 'Позиция не найдена') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: 'Ошибка обновления', error: error.message });
    }
  }

  // DELETE /receipt-act-items/:id — удалить позицию
  async removeRecord(req, res) {
    try {
      await ReceiptActItemService.delete(req.params.id);
      return res.json({ message: 'Позиция успешно удалена' });
    } catch (error) {
      console.error(`Ошибка при удалении позиции ${req.params.id}:`, error);
      if (error.message === 'Позиция не найдена') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }
}

module.exports = new ReceiptActItemController();