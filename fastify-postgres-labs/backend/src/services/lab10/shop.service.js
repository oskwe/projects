import lab10Service from './lab10.service.js';

function getPool(db) {
  return db?.pool || db;
}

function normalizeProduct(row) {
  return {
    ...row,
    category_name: row.category_name || row.category || '',
  };
}

const shopService = {
  async getCategories(db) {
    const categories = await lab10Service.getCategories(db);
    return categories.map((category) => ({
      ...category,
      name: category.title,
    }));
  },

  async getProducts(db, query = {}) {
    const data = await lab10Service.getProducts(db, {
      page: query.page,
      category: query.categoryId || query.category,
      q: query.search || query.q,
    });

    return {
      ...data,
      items: data.items.map(normalizeProduct),
    };
  },

  async createProduct(db, payload) {
    const product = await lab10Service.createProduct(db, {
      ...payload,
      description: payload.description || '',
    });

    return normalizeProduct(product);
  },

  async updateProduct(db, id, payload) {
    const pool = getPool(db);
    const { rows } = await pool.query(
      `UPDATE lab10.products
       SET category_id = $1,
           title = $2,
           description = COALESCE($3, description),
           price = $4,
           amount = $5,
           image = $6
       WHERE id = $7
       RETURNING *`,
      [
        payload.category_id,
        payload.title,
        payload.description || '',
        payload.price,
        payload.amount,
        payload.image || '',
        id,
      ],
    );

    return rows[0] ? normalizeProduct(rows[0]) : null;
  },

  async deleteProduct(db, id) {
    const pool = getPool(db);
    const { rows } = await pool.query('DELETE FROM lab10.products WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  },
};

export default shopService;
