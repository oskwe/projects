const db = require('../models'); // предполагается, что у вас есть index.js в models/

class InvoiceService {
  async createInvoice(headerData, bodyItems) {
    const transaction = await db.sequelize.transaction();
    try {
      // Создаём заголовок
      const header = await db.invoiceheader.create(headerData, { transaction });

      // Создаём строки
      const bodies = await Promise.all(
        bodyItems.map(item =>
          db.invoicebody.create(
            {
              ...item,
              invoiceHeaderId: header.id,
            },
            { transaction }
          )
        )
      );

      await transaction.commit();
      return { header, bodies };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllInvoices() {
    return await db.invoiceheader.findAll({
      include: [
        { model: db.individuals, as: 'individuals' },
        { model: db.organizations, as: 'organizations' },
        {
          model: db.invoicebody,
          as: 'invoicebodies',
          include: [{ model: db.product, as: 'product' }],
        },
      ],
      order: [['issueDate', 'DESC']],
    });
  }

  async getInvoiceById(id) {
    const invoice = await db.invoiceheader.findByPk(id, {
      include: [
        { model: db.individuals, as: 'individuals' },
        { model: db.organizations, as: 'organizations' },
        {
          model: db.invoicebody,
          as: 'invoicebodies',
          include: [{ model: db.product, as: 'product' }],
        },
      ],
    });
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async deleteInvoice(id) {
    const invoice = await db.invoiceheader.findByPk(id);
    if (!invoice) throw new Error('Invoice not found');

    await db.invoicebody.destroy({ where: { invoiceHeaderId: id } });
    await invoice.destroy();
  }
}

module.exports = new InvoiceService();