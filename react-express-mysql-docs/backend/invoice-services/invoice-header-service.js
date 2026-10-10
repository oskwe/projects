// invoice-services/invoice-header-service.js - БЕЗ МОДЕЛЕЙ
console.log('Loading invoice-header-service.js - NO DB');

class InvoiceHeaderService {
  async getAll() {
    console.log('invoiceHeaderService.getAll()');
    return [{ id: 1, number: 'INV-001', date: new Date().toISOString() }];
  }

  async getById(id) {
    console.log(`invoiceHeaderService.getById(${id})`);
    return { id, number: `INV-${id}`, date: new Date().toISOString() };
  }

  async create(data) {
    console.log('invoiceHeaderService.create()', data);
    return { id: Date.now(), ...data };
  }

  async update(id, data) {
    console.log(`invoiceHeaderService.update(${id})`, data);
    return { id, ...data };
  }

  async delete(id) {
    console.log(`invoiceHeaderService.delete(${id})`);
    return true;
  }
}

module.exports = new InvoiceHeaderService();