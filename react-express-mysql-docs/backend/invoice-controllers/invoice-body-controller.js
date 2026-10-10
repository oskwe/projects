// invoice-controllers/invoice-body-controller.js
const { invoiceBodyService } = require('../invoice-services');

class InvoiceBodyController {
  async getAllHeadersRecords(req, res) {
    try {
      const { invoiceId } = req.params;
      const items = await invoiceBodyService.getByInvoiceId(invoiceId);
      res.json(items);
    } catch (error) {
      console.error('Ошибка при получении позиций счёта:', error);
      res.status(500).json({ error: 'Не удалось загрузить позиции счёта' });
    }
  }

  async getOneRecord(req, res) {
    try {
      const { id } = req.params;
      const item = await invoiceBodyService.getById(id);
      
      if (!item) {
        return res.status(404).json({ error: 'Позиция счёта не найдена' });
      }
      
      res.json(item);
    } catch (error) {
      console.error('Ошибка при получении позиции:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  async createRecord(req, res) {
    try {
      const newItem = await invoiceBodyService.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Ошибка при создании позиции:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const item = await invoiceBodyService.update(id, req.body);
      
      if (!item) {
        return res.status(404).json({ error: 'Позиция не найдена' });
      }
      
      res.json(item);
    } catch (error) {
      console.error('Ошибка при обновлении позиции:', error);
      res.status(500).json({ error: 'Не удалось обновить позицию' });
    }
  }

  async removeRecord(req, res) {
    try {
      const { id } = req.params;
      const deleted = await invoiceBodyService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Позиция не найдена' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Ошибка при удалении позиции:', error);
      res.status(500).json({ error: 'Не удалось удалить позицию' });
    }
  }
}

module.exports = new InvoiceBodyController();