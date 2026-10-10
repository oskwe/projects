const ReceiptActService = require('../invoice-services/receipt-act-service');

class ReceiptActController {

  // GET /receipt-acts — получить все акты
  async getAllRecords(req, res) {
    try {
      const records = await ReceiptActService.getAll();
      return res.json(records);
    } catch (error) {
      console.error('Ошибка при получении актов:', error);
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  // GET /receipt-acts/:id — получить один акт
  async getOneRecord(req, res) {
    try {
      const record = await ReceiptActService.getById(req.params.id);
      return res.json(record);
    } catch (error) {
      console.error(`Ошибка при получении акта ${req.params.id}:`, error);
      if (error.message === 'Акт не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  // POST /receipt-acts — создать новый акт
  async createRecord(req, res) {
    try {
      const newAct = await ReceiptActService.create(req.body);
      return res.status(201).json(newAct);
    } catch (error) {
      console.error('Ошибка при создании акта:', error);
      return res.status(400).json({ message: 'Ошибка создания', error: error.message });
    }
  }

  // PUT /receipt-acts — обновить акт
  async updateRecord(req, res) {
    try {
      const updatedAct = await ReceiptActService.update(req.body.id, req.body);
      return res.json(updatedAct);
    } catch (error) {
      console.error('Ошибка при обновлении акта:', error);
      if (error.message === 'Акт не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: 'Ошибка обновления', error: error.message });
    }
  }

  // DELETE /receipt-acts/:id — удалить акт
  async removeRecord(req, res) {
    try {
      await ReceiptActService.delete(req.params.id);
      return res.json({ message: 'Акт успешно удалён' });
    } catch (error) {
      console.error(`Ошибка при удалении акта ${req.params.id}:`, error);
      if (error.message === 'Акт не найден') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }
}

module.exports = new ReceiptActController();