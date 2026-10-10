const express = require('express');
const router = express.Router();

// Импортируем только рабочие контроллеры
const InvoiceHeaderController = require('../invoice-controllers/invoice-header-controller');
const InvoiceBodyController = require('../invoice-controllers/invoice-body-controller');
// ЗАКОММЕНТИРУЙТЕ проблемные импорты на время
// const ReceiptActController = require('../invoice-controllers/receipt-act-controller');
// const ReceiptActItemController = require('../invoice-controllers/receipt-act-item-controller');
// const SupplierController = require('../invoice-controllers/supplier-controller');
// const MaterialController = require('../invoice-controllers/material-controller');

console.log('invoice-router.js loaded - LIMITED VERSION');

// Рабочие маршруты
router.get('/invoices', InvoiceHeaderController.getAllRecords);
router.get('/invoices/:id', InvoiceHeaderController.getOneRecord);
router.post('/invoices', InvoiceHeaderController.createRecord);
router.put('/invoices', InvoiceHeaderController.updateRecord);
router.delete('/invoices/:id', InvoiceHeaderController.removeRecord);

router.get('/invoice-bodies/by-invoice/:invoiceId', InvoiceBodyController.getAllHeadersRecords);
router.get('/invoice-bodies/:id', InvoiceBodyController.getOneRecord);
router.post('/invoice-bodies', InvoiceBodyController.createRecord);
router.put('/invoice-bodies/:id', InvoiceBodyController.updateRecord);
router.delete('/invoice-bodies/:id', InvoiceBodyController.removeRecord);


// Заглушки для остальных маршрутов
router.get('/receipt-acts', (req, res) => res.json({ message: 'Coming soon' }));
router.get('/suppliers', (req, res) => res.json({ message: 'Coming soon' }));
router.get('/materials', (req, res) => res.json({ message: 'Coming soon' }));

module.exports = router;