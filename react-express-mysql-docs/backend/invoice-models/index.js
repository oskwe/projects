// invoice-models/index.js
const InvoiceHeader = require('./invoice-header-model.js');
const InvoiceBody = require('./invoice-body-model.js');
const ReceiptAct = require('./receipt-act-model.js');
const ReceiptActItem = require('./receipt-act-item-model.js');
const Supplier = require('./suppliers-model.js');  // Обратите внимание: suppliers-model.js
const Material = require('./materials-model.js');  // Обратите внимание: materials-model.js

console.log('invoice-models/index.js loaded');

const db = {
  InvoiceHeader,
  InvoiceBody,
  ReceiptAct,
  ReceiptActItem,
  Supplier,
  Material
};

module.exports = db;