import { instanceAxios } from "../axios-config";

export default class ProxyBodyService {
    static apiUrl = '/api/proxy-bodies';

    static async getAllHeadersRecords(body) {
        const url = `${this.apiUrl}/${body}`;
        console.log("Fetching from URL:", url); // Выводим URL
        const res = await instanceAxios.get(url);
        return res.data;
    }

    static async createRecord(body) {
        try {
            const res = await instanceAxios.post(this.apiUrl, body);
            return res.data;
        } catch (error) {
            console.error("Error creating record:", error);
            throw error; // или обработка ошибки
        }
    }

    static async updateRecord(id, body) { // предположим, что id - это идентификатор записи
        try {
            const res = await instanceAxios.put(`${this.apiUrl}/${id}`, body);
            return res.data;
        } catch (error) {
            console.error("Error updating record:", error);
            throw error; // или обработка ошибки
        }
    }

    static async removeRecord(id) { // предположим, что id - это идентификатор записи
        try {
            const res = await instanceAxios.delete(`${this.apiUrl}/${id}`);
            return res.data;
        } catch (error) {
            console.error("Error removing record:", error);
            throw error; // или обработка ошибки
        }
    }
}
