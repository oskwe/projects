const ProductModel = require('../models/product-model');

class ProductService {
    /** получить все записи из таблицы "products" */
    async getAllRecords() {
        const list = await ProductModel.findAll();
        return list;
    };

    /** создать запись в таблице "products" */
    async createRecord(payload) {
        const data = await ProductModel.create(payload);
        return data;
    }


    /** обновить запись в таблице "products" */
    async updateRecord(payload) {
        let record = await ProductModel.findOne({ where: { id: payload.id } });
        record.title = payload?.title || record.title;        
        return await record.save();
    }

        /** удалить запись из таблицы "products" */
        async removeRecord(recordId) {
            const record = await ProductModel.destroy({ where: { id: recordId } });
            return record;
        }
    
}

module.exports = new ProductService();
