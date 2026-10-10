const express = require('express');
const router = express.Router(); // ФИКС: Используем express.Router() вместо new Router()

// Импортируем контроллеры справочников и документов
const ProductController = require('../controllers/product-controller');
const IndividualsController = require('../controllers/individuals-controller');
const OrganizationsController = require('../controllers/organizations-controller');
const ProxyBodyController = require('../controllers/proxy-body-controller');
const ProxyHeaderController = require('../controllers/proxy-header-controller');

// Импортируем invoice-router (для счетов, актов, поставщиков, материалов)
const invoiceRouter = require('./invoice-router');

// === Справочники (с префиксом /api) ===
router.get('/api/product', ProductController.getAllRecords);
router.get('/api/individuals', IndividualsController.getAllRecords);
router.get('/api/organizations', OrganizationsController.getAllRecords);

// === Документы: Доверенности (с префиксом /api) ===
router.get('/api/proxy-bodies/:headerId', ProxyBodyController.getAllHeadersRecords);
router.get('/api/proxyheader', ProxyHeaderController.getAllRecords);
router.get('/api/proxyheader/:id', ProxyHeaderController.getOneRecords);

// === POST (с префиксом /api) ===
router.post('/api/product', ProductController.createRecord);
router.post('/api/individuals', IndividualsController.createRecord);
router.post('/api/organizations', OrganizationsController.createRecord);
router.post('/api/proxy-bodies', ProxyBodyController.createRecord);
router.post('/api/proxyheader', ProxyHeaderController.createRecord);

// === PUT (с префиксом /api) ===
router.put('/api/product', ProductController.updateRecord);
router.put('/api/individuals', IndividualsController.updateRecord);
router.put('/api/organizations', OrganizationsController.updateRecord);
router.put('/api/proxy-bodies', ProxyBodyController.updateRecord);
router.put('/api/proxyheader', ProxyHeaderController.updateRecord);

// === DELETE (с префиксом /api) ===
router.delete('/api/product/:id', ProductController.removeRecord);
router.delete('/api/individuals/:id', IndividualsController.removeRecord);
router.delete('/api/organizations/:id', OrganizationsController.removeRecord);
router.delete('/api/proxy-bodies/:id', ProxyBodyController.removeRecord);
router.delete('/api/proxyheader/:id', ProxyHeaderController.removeRecord);

// === Подключаем маршруты из invoice-router.js ===
// ВАЖНО: invoice-router.js должен экспортировать функцию роутера (express.Router())
router.use('/api', invoiceRouter);

// Базовый маршрут для проверки
router.get('/', (req, res) => {
  res.json({
    message: 'API Proxy-Backend работает',
    endpoints: {
      invoices: '/api/invoices',
      'invoice-bodies': '/api/invoice-bodies',
      'receipt-acts': '/api/receipt-acts',
      'receipt-act-items': '/api/receipt-act-items',
      suppliers: '/api/suppliers',
      materials: '/api/materials',
      product: '/api/product',
      individuals: '/api/individuals',
      organizations: '/api/organizations',
      'proxy-bodies': '/api/proxy-bodies',
      proxyheader: '/api/proxyheader'
    }
  });
});

module.exports = router;