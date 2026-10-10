const OrganizationsModel = require('../models/organizations-model');

class OrganizationsService {
    /** получить все записи из таблицы "products" */
    async getAllRecords() {
        const list = await OrganizationsModel.findAll();
        return list;
    };

    /** создать запись в таблице "products" */
    async createRecord(payload) {
        const data = await OrganizationsModel.create(payload);
        return data;
    }


    /** обновить запись в таблице "products" */
    async updateRecord(payload) {
        let record = await OrganizationsModel.findOne({ where: { id: payload.id } });
        record.title = payload?.title || record.title;     
        record.inn = payload?.inn || record.inn;        
        return await record.save();
    }

        /** удалить запись из таблицы "products" */
        async removeRecord(recordId) {
            const record = await OrganizationsModel.destroy({ where: { id: recordId } });
            return record;
        }
    
}

module.exports = new OrganizationsService();
