const IndividualsModel = require('../models/individuals-model');

class IndividualsService {
    /** получить все записи из таблицы "products" */
    async getAllRecords() {
        const list = await IndividualsModel.findAll();
        return list;
    };

    /** создать запись в таблице "products" */
    async createRecord(payload) {
        const data = await IndividualsModel.create(payload);
        return data;
    }


    /** обновить запись в таблице "products" */
    async updateRecord(payload) {
        let record = await IndividualsModel.findOne({ where: { id: payload.id } });
        record.firstName = payload?.firstName || record.firstName;
        record.lastName = payload?.lastName || record.lastName;
        record.patronymic = payload?.patronymic || record.patronymic;        
        record.issued = payload?.issued || record.issued;        
        record.series = payload?.series || record.series;        
        record.number = payload?.number || record.number;        

        return await record.save();
    }

        /** удалить запись из таблицы "products" */
        async removeRecord(recordId) {
            const record = await IndividualsModel.destroy({ where: { id: recordId } });
            return record;
        }
    
}

module.exports = new IndividualsService();
