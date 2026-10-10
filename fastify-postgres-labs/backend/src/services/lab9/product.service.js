function getPool(db) {
  return db?.pool || db;
}

class ProductService {
  async ensureReady(db) {
    const pool = getPool(db);
    await pool.query('CREATE SCHEMA IF NOT EXISTS lab9');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab9.products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL CHECK (price >= 0),
        amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
        image TEXT
      )
    `);
  }

  async getAll(db, q = '') {
    const pool = getPool(db);
    if (q) {
      const { rows } = await pool.query(
        'SELECT * FROM lab9.products WHERE title ILIKE $1 ORDER BY id DESC',
        [`%${q}%`],
      );
      return rows;
    }

    const { rows } = await pool.query('SELECT * FROM lab9.products ORDER BY id DESC');
    return rows;
  }

  async getById(db, id) {
    const pool = getPool(db);
    const { rows } = await pool.query('SELECT * FROM lab9.products WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async getStock(db) {
    const pool = getPool(db);
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total_products,
        COALESCE(SUM(amount), 0)::int AS total_items,
        COALESCE(SUM(price * amount), 0)::bigint AS total_value
      FROM lab9.products
    `);
    return {
      total_products: rows[0].total_products,
      total_items: rows[0].total_items,
      total_value: Number(rows[0].total_value),
    };
  }

  async create(db, productData) {
    const pool = getPool(db);
    const { title, price, amount, image = null } = productData;
    const { rows } = await pool.query(
      `INSERT INTO lab9.products (title, price, amount, image)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, price, amount, image],
    );
    return rows[0];
  }

  async update(db, id, productData) {
    const current = await this.getById(db, id);
    if (!current) {
      return null;
    }

    const next = {
      title: productData.title ?? current.title,
      price: productData.price ?? current.price,
      amount: productData.amount ?? current.amount,
      image: productData.image ?? current.image,
    };

    const pool = getPool(db);
    const { rows } = await pool.query(
      `UPDATE lab9.products
       SET title = $1, price = $2, amount = $3, image = $4
       WHERE id = $5
       RETURNING *`,
      [next.title, next.price, next.amount, next.image, id],
    );
    return rows[0];
  }

  async delete(db, id) {
    const pool = getPool(db);
    const { rows } = await pool.query('DELETE FROM lab9.products WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  }

  async checkAvailability(db, items) {
    const pool = getPool(db);
    const checked = [];
    const unavailable = [];
    let total = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const id = Number(item.id);
      if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
        unavailable.push({
          id,
          requested: quantity,
          available: 0,
          error: 'Invalid cart item',
        });
        continue;
      }

      const product = await this.getById(db, id);
      const available = product ? product.amount : 0;
      if (!product || available < quantity) {
        unavailable.push({
          id,
          title: product?.title || '',
          requested: quantity,
          available,
        });
        continue;
      }

      total += product.price * quantity;
      checked.push({ product, quantity });
    }

    return {
      ok: unavailable.length === 0,
      checked,
      unavailable,
      total,
    };
  }

  async purchase(db, items) {
    const pool = getPool(db);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const purchased = [];

      for (const item of items) {
        const quantity = Number(item.quantity);
        const id = Number(item.id);
        if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1) {
          throw new Error('Invalid cart item');
        }

        const { rows } = await client.query(
          `UPDATE lab9.products
           SET amount = amount - $1
           WHERE id = $2 AND amount >= $1
           RETURNING *`,
          [quantity, id],
        );

        if (!rows[0]) {
          throw new Error(`Not enough stock or product not found: ${id}`);
        }

        purchased.push({ product: rows[0], quantity });
      }

      await client.query('COMMIT');
      return purchased;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new ProductService();
