export const ROUTE_PATHS = {
    product: 'product',
    individuals: 'individuals',
    organizations: 'organizations', // Маршрут для организаций из основной базы данных
    proxy: {
        list: 'proxy',
        proxy: 'proxy/:id',
    },
    create: 'create',
    // Маршруты для второй базы данных
    assets: 'assets', // Маршрут для assets из второй базы данных
    correspondent: 'correspondent',
    invoiceHeaders: 'invoiceheaders',
    invoiceHeadersId: 'invoice-body/:id',
    organizationsDB: 'organizationsDB', // Маршрут для организаций из второй базы данных
};
