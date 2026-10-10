const db = require('../invoice-models');
const sequelize = require('../services/connection.js');
const { Op } = require('sequelize');

class InvoiceBodyService {
  /**
   * Получить все позиции по ID заголовка счёта
   */
  async getByInvoiceId(invoiceHeaderId) {
    return await db.InvoiceBody.findAll({
      where: { invoiceHeaderId },
      include: [{ 
        model: db.Material, 
        as: 'product',
        attributes: ['id', 'name', 'code', 'unit', 'description', 'category']
      }],
      order: [['id', 'ASC']]
    });
  }

  /**
   * Получить позицию по ID
   */
  async getById(id) {
    return await db.InvoiceBody.findByPk(id, {
      include: [{ 
        model: db.Material, 
        as: 'product',
        attributes: ['id', 'name', 'code', 'unit', 'price', 'description']
      }]
    });
  }

  /**
   * Создать новую позицию
   */
  async create(data) {
    const transaction = await sequelize.transaction();
    
    try {
      // Валидация данных
      this._validateItemData(data);
      
      // Автоматически рассчитываем total
      const total = (parseFloat(data.count) || 0) * (parseFloat(data.price) || 0);
      data.total = total;
      
      // Проверяем существование материала
      const material = await db.Material.findByPk(data.productId, { transaction });
      if (!material) {
        throw new Error(`Материал с ID ${data.productId} не найден`);
      }
      
      // Проверяем существование заголовка
      const header = await db.InvoiceHeader.findByPk(data.invoiceHeaderId, { transaction });
      if (!header) {
        throw new Error(`Счёт с ID ${data.invoiceHeaderId} не найден`);
      }
      
      const item = await db.InvoiceBody.create(data, { transaction });
      
      // Обновляем общую сумму счёта
      await this._updateInvoiceTotal(data.invoiceHeaderId, transaction);
      
      await transaction.commit();
      return item;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Создать несколько позиций сразу
   */
  async createBatch(items) {
    const transaction = await sequelize.transaction();
    
    try {
      const createdItems = [];
      
      for (const itemData of items) {
        this._validateItemData(itemData);
        
        const total = (parseFloat(itemData.count) || 0) * (parseFloat(itemData.price) || 0);
        itemData.total = total;
        
        const item = await db.InvoiceBody.create(itemData, { transaction });
        createdItems.push(item);
      }
      
      // Обновляем общую сумму счёта (берём из первого элемента)
      if (items.length > 0 && items[0].invoiceHeaderId) {
        await this._updateInvoiceTotal(items[0].invoiceHeaderId, transaction);
      }
      
      await transaction.commit();
      return createdItems;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Обновить позицию
   */
  async update(id, data) {
    const transaction = await sequelize.transaction();
    
    try {
      const item = await db.InvoiceBody.findByPk(id, { transaction });
      if (!item) {
        await transaction.rollback();
        return null;
      }
      
      // Если меняем productId, проверяем существование материала
      if (data.productId && data.productId !== item.productId) {
        const material = await db.Material.findByPk(data.productId, { transaction });
        if (!material) {
          throw new Error(`Материал с ID ${data.productId} не найден`);
        }
      }
      
      // Пересчитываем total если изменились count или price
      let recalcTotal = false;
      if (data.count !== undefined || data.price !== undefined) {
        const count = data.count !== undefined ? data.count : item.count;
        const price = data.price !== undefined ? data.price : item.price;
        data.total = parseFloat(count) * parseFloat(price);
        recalcTotal = true;
      }
      
      await item.update(data, { transaction });
      
      // Обновляем общую сумму счёта
      if (recalcTotal || data.invoiceHeaderId) {
        const invoiceHeaderId = data.invoiceHeaderId || item.invoiceHeaderId;
        await this._updateInvoiceTotal(invoiceHeaderId, transaction);
      }
      
      await transaction.commit();
      return item;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Удалить позицию
   */
  async delete(id) {
    const transaction = await sequelize.transaction();
    
    try {
      const item = await db.InvoiceBody.findByPk(id, { transaction });
      if (!item) {
        await transaction.rollback();
        return false;
      }
      
      const invoiceHeaderId = item.invoiceHeaderId;
      await item.destroy({ transaction });
      
      // Обновляем общую сумму счёта
      await this._updateInvoiceTotal(invoiceHeaderId, transaction);
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Удалить все позиции по ID счёта
   */
  async deleteByInvoiceId(invoiceHeaderId) {
    const transaction = await sequelize.transaction();
    
    try {
      const result = await db.InvoiceBody.destroy({
        where: { invoiceHeaderId },
        transaction
      });
      
      // Обновляем общую сумму счёта
      await this._updateInvoiceTotal(invoiceHeaderId, transaction);
      
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Копировать позиции из одного счёта в другой
   */
  async copyItems(sourceInvoiceId, targetInvoiceId) {
    const transaction = await sequelize.transaction();
    
    try {
      const sourceItems = await db.InvoiceBody.findAll({
        where: { invoiceHeaderId: sourceInvoiceId },
        transaction
      });
      
      const copiedItems = [];
      for (const sourceItem of sourceItems) {
        const itemData = {
          invoiceHeaderId: targetInvoiceId,
          productId: sourceItem.productId,
          count: sourceItem.count,
          unit: sourceItem.unit,
          price: sourceItem.price,
          total: sourceItem.total
        };
        
        const newItem = await db.InvoiceBody.create(itemData, { transaction });
        copiedItems.push(newItem);
      }
      
      // Обновляем общую сумму целевого счёта
      await this._updateInvoiceTotal(targetInvoiceId, transaction);
      
      await transaction.commit();
      return copiedItems;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Получить позиции по материалу (для анализа закупок)
   */
  async getByMaterialId(productId, filters = {}) {
    const where = { productId };
    
    if (filters.dateFrom && filters.dateTo) {
      where.createdAt = {
        [Op.between]: [filters.dateFrom, filters.dateTo]
      };
    }
    
    return await db.InvoiceBody.findAll({
      where,
      include: [
        {
          model: db.InvoiceHeader,
          as: 'header',
          attributes: ['id', 'number', 'date', 'supplierId'],
          include: [{
            model: db.Supplier,
            as: 'supplier',
            attributes: ['id', 'name']
          }]
        },
        {
          model: db.Material,
          as: 'product',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Получить статистику по материалам в счетах
   */
  async getMaterialStatistics(period = 'month') {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return await db.InvoiceBody.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      include: [{
        model: db.Material,
        as: 'product',
        attributes: ['id', 'name', 'category']
      }],
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('count')), 'totalCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'invoiceCount']
      ],
      group: ['productId'],
      order: [[sequelize.fn('SUM', sequelize.col('total')), 'DESC']],
      raw: true
    });
  }

  /**
   * Пересчитать все totals для позиций счёта
   */
  async recalculateTotals(invoiceHeaderId) {
    const transaction = await sequelize.transaction();
    
    try {
      const items = await db.InvoiceBody.findAll({
        where: { invoiceHeaderId },
        transaction
      });
      
      for (const item of items) {
        const total = parseFloat(item.count) * parseFloat(item.price);
        if (Math.abs(total - parseFloat(item.total)) > 0.01) {
          await item.update({ total }, { transaction });
        }
      }
      
      // Обновляем общую сумму
      await this._updateInvoiceTotal(invoiceHeaderId, transaction);
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ========== PRIVATE METHODS ==========
  
  /**
   * Валидация данных позиции
   */
  _validateItemData(data) {
    const requiredFields = ['count', 'unit', 'price', 'invoiceHeaderId', 'productId'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
    }
    
    if (parseFloat(data.count) <= 0) {
      throw new Error('Количество должно быть больше 0');
    }
    
    if (parseFloat(data.price) < 0) {
      throw new Error('Цена не может быть отрицательной');
    }
  }

  /**
   * Обновить общую сумму счёта
   */
  async _updateInvoiceTotal(invoiceHeaderId, transaction = null) {
    const options = {};
    if (transaction) options.transaction = transaction;
    
    const items = await db.InvoiceBody.findAll({
      where: { invoiceHeaderId },
      ...options
    });
    
    const totalAmount = items.reduce((sum, item) => {
      return sum + parseFloat(item.total || 0);
    }, 0);
    
    await db.InvoiceHeader.update(
      { totalAmount },
      { 
        where: { id: invoiceHeaderId },
        ...options
      }
    );
    
    return totalAmount;
  }
}

module.exports = new InvoiceBodyService();