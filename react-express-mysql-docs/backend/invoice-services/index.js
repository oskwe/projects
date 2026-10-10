// invoice-models/index.js - ПРОСТАЯ ЗАГЛУШКА
console.log('invoice-models/index.js loaded - SIMPLE STUB');

// Простые заглушки для моделей
const models = {
  InvoiceHeader: {
    findAll: async () => {
      console.log('InvoiceHeader.findAll() - STUB');
      return [];
    },
    findByPk: async (id) => {
      console.log(`InvoiceHeader.findByPk(${id}) - STUB`);
      return { id, number: `INV-${id}` };
    },
    create: async (data) => {
      console.log('InvoiceHeader.create() - STUB', data);
      return { id: 1, ...data };
    },
    update: async (data, options) => {
      console.log('InvoiceHeader.update() - STUB', data);
      return [1];
    },
    destroy: async (options) => {
      console.log('InvoiceHeader.destroy() - STUB', options);
      return 1;
    }
  },
  // Добавьте другие модели по аналогии
  InvoiceBody: {},
  ReceiptAct: {},
  ReceiptActItem: {},
  Supplier: {},
  Material: {}
};

module.exports = models;