import fs from 'fs/promises';

const INIT_SQL_URL = new URL('../../../db/init/02-lab10.sql', import.meta.url);
const PAGE_LIMIT = 6;

function getPool(db) {
  return db?.pool || db;
}

function toInt(value, fallback = null) {
  const number = Number(value);
  return Number.isInteger(number) ? number : fallback;
}

const directories = {
  departments: {
    table: 'lab10.departments',
    columns: ['title'],
    order: 'id',
    select: 'SELECT id, title FROM lab10.departments ORDER BY id',
  },
  positions: {
    table: 'lab10.positions',
    columns: ['title'],
    order: 'id',
    select: 'SELECT id, title FROM lab10.positions ORDER BY id',
  },
  persons: {
    table: 'lab10.persons',
    columns: ['full_name', 'email'],
    order: 'id',
    select: 'SELECT id, full_name, email FROM lab10.persons ORDER BY id',
  },
  teachers: {
    table: 'lab10.teachers',
    columns: ['person_id', 'department_id', 'position_id'],
    order: 'id',
    select: `
      SELECT
        t.id,
        t.person_id,
        t.department_id,
        t.position_id,
        p.full_name,
        d.title AS department,
        pos.title AS position
      FROM lab10.teachers t
      JOIN lab10.persons p ON p.id = t.person_id
      JOIN lab10.departments d ON d.id = t.department_id
      JOIN lab10.positions pos ON pos.id = t.position_id
      ORDER BY t.id
    `,
  },
  groups: {
    table: 'lab10.study_groups',
    columns: ['title'],
    order: 'id',
    select: 'SELECT id, title FROM lab10.study_groups ORDER BY id',
  },
  buildings: {
    table: 'lab10.buildings',
    columns: ['title', 'address'],
    order: 'id',
    select: 'SELECT id, title, address FROM lab10.buildings ORDER BY id',
  },
  classrooms: {
    table: 'lab10.classrooms',
    columns: ['building_id', 'title', 'capacity'],
    order: 'id',
    select: `
      SELECT c.id, c.building_id, c.title, c.capacity, b.title AS building
      FROM lab10.classrooms c
      JOIN lab10.buildings b ON b.id = c.building_id
      ORDER BY c.id
    `,
  },
  disciplines: {
    table: 'lab10.disciplines',
    columns: ['title'],
    order: 'id',
    select: 'SELECT id, title FROM lab10.disciplines ORDER BY id',
  },
  'lesson-types': {
    table: 'lab10.lesson_types',
    columns: ['title'],
    order: 'id',
    select: 'SELECT id, title FROM lab10.lesson_types ORDER BY id',
  },
};

class Lab10Service {
  ready = null;

  async ensureReady(db) {
    if (!this.ready) {
      this.ready = (async () => {
        const pool = getPool(db);
        const sql = await fs.readFile(INIT_SQL_URL, 'utf8');
        await pool.query(sql);
      })();
    }
    return this.ready;
  }

  async getCategories(db) {
    const pool = getPool(db);
    const { rows } = await pool.query('SELECT id, title FROM lab10.categories ORDER BY title');
    return rows;
  }

  async createCategory(db, payload) {
    const pool = getPool(db);
    const { rows } = await pool.query(
      `INSERT INTO lab10.categories (title)
       VALUES ($1)
       RETURNING id, title`,
      [payload.title],
    );
    return rows[0];
  }

  async getProducts(db, query = {}) {
    const pool = getPool(db);
    const page = Math.max(1, toInt(query.page, 1));
    const limit = PAGE_LIMIT;
    const offset = (page - 1) * limit;
    const values = [];
    const where = [];

    if (query.category) {
      values.push(toInt(query.category, 0));
      where.push(`p.category_id = $${values.length}`);
    }

    if (query.q) {
      values.push(`%${query.q}%`);
      where.push(`(p.title ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM lab10.products p
      ${whereSql}
    `;
    const { rows: countRows } = await pool.query(countQuery, values);

    values.push(limit, offset);
    const productQuery = `
      SELECT p.*, c.title AS category
      FROM lab10.products p
      JOIN lab10.categories c ON c.id = p.category_id
      ${whereSql}
      ORDER BY p.id
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;
    const { rows } = await pool.query(productQuery, values);
    const total = countRows[0].total;

    return {
      items: rows,
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getProductById(db, id) {
    const pool = getPool(db);
    const { rows } = await pool.query(
      `SELECT p.*, c.title AS category
       FROM lab10.products p
       JOIN lab10.categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id],
    );
    return rows[0] || null;
  }

  async createProduct(db, payload) {
    const pool = getPool(db);
    const { rows } = await pool.query(
      `INSERT INTO lab10.products (category_id, title, description, price, amount, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        payload.category_id,
        payload.title,
        payload.description,
        payload.price,
        payload.amount,
        payload.image || '',
      ],
    );
    return rows[0];
  }

  async getOrders(db) {
    const pool = getPool(db);
    const { rows } = await pool.query(`
      SELECT
        o.id,
        o.customer_name,
        o.customer_phone,
        o.created_at,
        COALESCE(SUM(oi.quantity * oi.price), 0)::bigint AS total,
        COALESCE(SUM(oi.quantity), 0)::int AS items_count
      FROM lab10.orders o
      LEFT JOIN lab10.order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC, o.id DESC
    `);
    return rows.map((row) => ({ ...row, total: Number(row.total) }));
  }

  async getOrderById(db, id) {
    const pool = getPool(db);
    const { rows: orderRows } = await pool.query('SELECT * FROM lab10.orders WHERE id = $1', [id]);
    const order = orderRows[0];
    if (!order) {
      return null;
    }

    const { rows: items } = await pool.query(
      `SELECT
        oi.id,
        oi.product_id,
        p.title,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price)::bigint AS cost
       FROM lab10.order_items oi
       JOIN lab10.products p ON p.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [id],
    );

    const normalizedItems = items.map((item) => ({
      ...item,
      cost: Number(item.cost),
    }));

    return {
      ...order,
      items: normalizedItems,
      total: normalizedItems.reduce((sum, item) => sum + item.cost, 0),
    };
  }

  async buyProduct(db, productId, payload) {
    const pool = getPool(db);
    const client = await pool.connect();
    const quantity = Math.max(1, toInt(payload.quantity, 1));
    const customerName = String(payload.customerName || 'Customer').trim() || 'Customer';
    const customerPhone = String(payload.customerPhone || '').trim() || '-';

    try {
      await client.query('BEGIN');
      const { rows: products } = await client.query(
        'SELECT * FROM lab10.products WHERE id = $1 FOR UPDATE',
        [productId],
      );
      const product = products[0];

      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      if (product.amount < quantity) {
        const error = new Error('Not enough stock');
        error.statusCode = 400;
        error.available = product.amount;
        throw error;
      }

      const { rows: orders } = await client.query(
        `INSERT INTO lab10.orders (customer_name, customer_phone)
         VALUES ($1, $2)
         RETURNING *`,
        [customerName, customerPhone],
      );
      const order = orders[0];

      await client.query(
        `INSERT INTO lab10.order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, product.id, quantity, product.price],
      );

      await client.query(
        'UPDATE lab10.products SET amount = amount - $1 WHERE id = $2',
        [quantity, product.id],
      );

      await client.query('COMMIT');
      return this.getOrderById(db, order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getDirectoryConfig(name) {
    return directories[name] || null;
  }

  async listDirectory(db, name) {
    const config = this.getDirectoryConfig(name);
    if (!config) {
      return null;
    }
    const pool = getPool(db);
    const { rows } = await pool.query(config.select);
    return rows;
  }

  async createDirectoryItem(db, name, payload) {
    const config = this.getDirectoryConfig(name);
    if (!config) {
      return null;
    }
    const pool = getPool(db);
    const values = config.columns.map((column) => payload[column]);
    const placeholders = config.columns.map((_, index) => `$${index + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO ${config.table} (${config.columns.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      values,
    );
    return rows[0];
  }

  async updateDirectoryItem(db, name, id, payload) {
    const config = this.getDirectoryConfig(name);
    if (!config) {
      return null;
    }
    const pool = getPool(db);
    const columns = config.columns.filter((column) => payload[column] !== undefined);
    if (!columns.length) {
      return this.getDirectoryItem(db, config.table, id);
    }

    const values = columns.map((column) => payload[column]);
    values.push(id);
    const setSql = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE ${config.table}
       SET ${setSql}
       WHERE id = $${values.length}
       RETURNING *`,
      values,
    );
    return rows[0] || null;
  }

  async deleteDirectoryItem(db, name, id) {
    const config = this.getDirectoryConfig(name);
    if (!config) {
      return null;
    }
    const pool = getPool(db);
    const { rows } = await pool.query(`DELETE FROM ${config.table} WHERE id = $1 RETURNING id`, [id]);
    return rows[0] || null;
  }

  async getDirectoryItem(db, table, id) {
    const pool = getPool(db);
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return rows[0] || null;
  }

  async getScheduleRefs(db) {
    const [
      groups,
      buildings,
      classrooms,
      disciplines,
      lessonTypes,
      teachers,
      departments,
      positions,
      persons,
    ] = await Promise.all([
      this.listDirectory(db, 'groups'),
      this.listDirectory(db, 'buildings'),
      this.listDirectory(db, 'classrooms'),
      this.listDirectory(db, 'disciplines'),
      this.listDirectory(db, 'lesson-types'),
      this.listDirectory(db, 'teachers'),
      this.listDirectory(db, 'departments'),
      this.listDirectory(db, 'positions'),
      this.listDirectory(db, 'persons'),
    ]);

    return {
      groups,
      buildings,
      classrooms,
      disciplines,
      lessonTypes,
      teachers,
      departments,
      positions,
      persons,
    };
  }

  async listSchedule(db, query = {}) {
    const pool = getPool(db);
    const values = [];
    const where = [];
    const filters = {
      week: 's.week',
      group: 's.group_id',
      day: 's.day_of_week',
      classroom: 's.classroom_id',
      discipline: 's.discipline_id',
      teacher: 's.teacher_id',
      lessonType: 's.lesson_type_id',
    };

    Object.entries(filters).forEach(([key, column]) => {
      if (query[key]) {
        values.push(toInt(query[key], 0));
        where.push(`${column} = $${values.length}`);
      }
    });

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `
      SELECT
        s.id,
        s.week,
        s.day_of_week,
        s.start_time,
        s.group_id,
        g.title AS group_title,
        s.classroom_id,
        c.title AS classroom,
        b.title AS building,
        s.discipline_id,
        d.title AS discipline,
        s.teacher_id,
        p.full_name AS teacher,
        s.lesson_type_id,
        lt.title AS lesson_type
      FROM lab10.schedule_lessons s
      JOIN lab10.study_groups g ON g.id = s.group_id
      JOIN lab10.classrooms c ON c.id = s.classroom_id
      JOIN lab10.buildings b ON b.id = c.building_id
      JOIN lab10.disciplines d ON d.id = s.discipline_id
      JOIN lab10.teachers t ON t.id = s.teacher_id
      JOIN lab10.persons p ON p.id = t.person_id
      JOIN lab10.lesson_types lt ON lt.id = s.lesson_type_id
      ${whereSql}
      ORDER BY s.week, s.day_of_week, s.start_time, s.id
      `,
      values,
    );
    return rows;
  }

  async createSchedule(db, payload) {
    const pool = getPool(db);
    const { rows } = await pool.query(
      `INSERT INTO lab10.schedule_lessons
       (week, day_of_week, start_time, group_id, classroom_id, discipline_id, teacher_id, lesson_type_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        payload.week,
        payload.day_of_week,
        payload.start_time,
        payload.group_id,
        payload.classroom_id,
        payload.discipline_id,
        payload.teacher_id,
        payload.lesson_type_id,
      ],
    );
    return rows[0];
  }

  async updateSchedule(db, id, payload) {
    const pool = getPool(db);
    const columns = [
      'week',
      'day_of_week',
      'start_time',
      'group_id',
      'classroom_id',
      'discipline_id',
      'teacher_id',
      'lesson_type_id',
    ].filter((column) => payload[column] !== undefined);

    if (!columns.length) {
      return null;
    }

    const values = columns.map((column) => payload[column]);
    values.push(id);
    const setSql = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE lab10.schedule_lessons
       SET ${setSql}
       WHERE id = $${values.length}
       RETURNING *`,
      values,
    );
    return rows[0] || null;
  }

  async deleteSchedule(db, id) {
    const pool = getPool(db);
    const { rows } = await pool.query('DELETE FROM lab10.schedule_lessons WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  }
}

export default new Lab10Service();
