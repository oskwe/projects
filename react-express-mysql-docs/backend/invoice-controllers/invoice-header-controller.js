// invoice-controllers/invoice-header-controller.js
const { invoiceHeaderService } = require('../invoice-services');

class InvoiceHeaderController {
  async getAllRecords(req, res) {
    try {
      const headers = await invoiceHeaderService.getAll();
      res.json(headers);
    } catch (error) {
      console.error('Ошибка при получении заголовков счетов:', error);
      res.status(500).json({ error: 'Не удалось загрузить заголовки счетов' });
    }
  }

  async getOneRecord(req, res) {
    try {
      const { id } = req.params;
      const header = await invoiceHeaderService.getById(id);
      
      if (!header) {
        return res.status(404).json({ error: 'Заголовок счёта не найден' });
      }
      
      res.json(header);
    } catch (error) {
      console.error('Ошибка при получении заголовка счёта:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  async createRecord(req, res) {
    try {
      const newHeader = await invoiceHeaderService.create(req.body);
      res.status(201).json(newHeader);
    } catch (error) {
      console.error('Ошибка при создании заголовка счёта:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async updateRecord(req, res) {
    try {
      const { id, ...data } = req.body;
      const header = await invoiceHeaderService.update(id, data);
      
      if (!header) {
        return res.status(404).json({ error: 'Заголовок счёта не найден' });
      }
      
      res.json(header);
    } catch (error) {
      console.error('Ошибка при обновлении заголовка счёта:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async removeRecord(req, res) {
    try {
      const { id } = req.params;
      const deleted = await invoiceHeaderService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Заголовок счёта не найден' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Ошибка при удалении заголовка счёта:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new InvoiceHeaderController();