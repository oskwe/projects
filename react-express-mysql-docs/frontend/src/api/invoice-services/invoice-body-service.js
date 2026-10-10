import { instanceAxios } from "../axios-config";

export default class InvoiceBodyService {
    static apiUrl = '/invoice-api/invoice-body'; // Обновляем URL здесь

    // Получить все записи для заголовка
    static async getAllHeadersRecords(headerId) {
        const url = `${this.apiUrl}/${headerId}`;
        console.log("Fetching from URL:", url); // Выводим URL для отладки
        const res = await instanceAxios.get(url);
        return res.data;
    }

    // Получить одну запись по ID
    static async getOneRecord(id) {
        try {
            const res = await instanceAxios.get(`${this.apiUrl}/${id}`);
            return res.data;
        } catch (error) {
            console.error("Error fetching record:", error);
            throw error;
        }
    }

    // Создать новую запись
    static async createRecord(body) {
        try {
            const res = await instanceAxios.post(this.apiUrl, body);
            return res.data;
        } catch (error) {
            console.error("Error creating record:", error);
            throw error;
        }
    }

    // Обновить запись по ID
    static async updateRecord(id, body) {
        try {
            const res = await instanceAxios.put(`${this.apiUrl}/${id}`, body);
            return res.data;
        } catch (error) {
            console.error("Error updating record:", error);
            throw error;
        }
    }

    // Удалить запись по ID
    static async removeRecord(id) {
        try {
            const res = await instanceAxios.delete(`${this.apiUrl}/${id}`);
            return res.data;
        } catch (error) {
            console.error("Error removing record:", error);
            throw error;
        }
    }
}
