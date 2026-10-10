const ProxyBodyService = require('../services/proxy-body-service');

class ProxyBodyController {
    async getAllHeadersRecords(req, res) {
        try {
            const headerId = req.params.id;
            const list = await ProxyBodyService.getAllHeadersRecords(headerId);
            if (!list) {
                return res.status(404).json({ message: "Record not found." });
            }
            return res.status(200).json(list);
        } catch (e) {
            return res.status(500).json({ message: "An error occurred." });
        }
    }

    async createRecord(req, res) {
        try {
            const record = await ProxyBodyService.createRecord(req.body);
            return res.status(201).json(record);
        } catch (e) {
            return res.status(500).json({ message: "An error occurred." });
        }
    }

    async updateRecord(req, res) {
        try {
            const recordId = req.params.id;
            const record = await ProxyBodyService.updateRecord(recordId, req.body);
            if (!record) {
                return res.status(404).json({ message: "Record not found." });
            }
            return res.status(200).json(record);
        } catch (e) {
            return res.status(500).json({ message: "An error occurred." });
        }
    }

    async removeRecord(req, res) {
        try {
            const recordId = req.params.id;
            const record = await ProxyBodyService.removeRecord(recordId);
            return res.status(200).json(record);
        } catch (e) {
            return res.status(500).json({ message: "An error occurred." });
        }
    }
}

module.exports = new ProxyBodyController();
