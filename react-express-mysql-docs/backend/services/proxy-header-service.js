const ProxyHeaderModel = require('../models/proxy-header-model');

class ProxyHeaderService {
    /** получить все записи из таблицы "products" */
    async getAllRecords() {
        const list = await ProxyHeaderModel.findAll();
        return list;
    }

    async getOneRecords(recordId) {
        const record = await ProxyHeaderModel.findOne({ where: { id: recordId } });
        return record;
    }

    /** создать запись в таблице "products" */
    async createRecord(payload) {
        const data = await ProxyHeaderModel.create(payload);
        return data;
    }


    /** обновить запись в таблице "products" */
    async updateRecord(payload) {
        let record = await ProxyHeaderModel.findOne({ where: { id: payload.id } });
        record.number = payload?.number || record.number;
        record.dischargeDate = payload?.dischargeDate || record.dischargeDate;
        record.endDate = payload?.endDate || record.endDate;
        record.individualsId = payload?.individualsId || record.individualsId;
        record.organizationsId = payload?.organizationsId || record.organizationsId;


        return await record.save();
    }

    /** удалить запись из таблицы "products" */
    async removeRecord(recordId) {
        const record = await ProxyHeaderModel.destroy({ where: { id: recordId } });
        return record;
    }
    
}

module.exports = new ProxyHeaderService();
