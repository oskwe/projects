// invoice-services/receipt-act-service.js - БЕЗ ИМПОРТА МОДЕЛЕЙ
console.log('Loading receipt-act-service.js - NO MODELS VERSION');

class ReceiptActService {
  async getAll() {
    console.log('receiptActService.getAll() - STUB');
    return [{ id: 1, actNumber: 'ACT-001', date: new Date().toISOString() }];
  }

  async getById(id) {
    console.log(`receiptActService.getById(${id}) - STUB`);
    return { 
      id, 
      actNumber: `ACT-${id}`, 
      date: new Date().toISOString(),
      supplierId: 1,
      totalAmount: 1000
    };
  }

  async create(data) {
    console.log('receiptActService.create() - STUB', data);
    return { id: 1, ...data };
  }

  async update(id, data) {
    console.log(`receiptActService.update(${id}) - STUB`, data);
    return { id, ...data };
  }

  async delete(id) {
    console.log(`receiptActService.delete(${id}) - STUB`);
    return true;
  }
}

module.exports = new ReceiptActService();