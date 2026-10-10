import { instanceAxios } from "../axios-config";

export default class AssetsService {

    static apiUrl = '/invoice-api/assets';

    static async getAllRecords() {
        const res = await instanceAxios.get(this.apiUrl);
        return res.data;
    }

    static async createRecord(body) {
        const res = await instanceAxios.post(this.apiUrl, body);
        return res.data;
    }

    static async updateRecord(body) {
        const res = await instanceAxios.put(this.apiUrl, body);
        return res.data;
    }

    static async removeRecord(id) {
        const res = await instanceAxios.delete(`${this.apiUrl}/${id}`);
        return res.data;
    }
}