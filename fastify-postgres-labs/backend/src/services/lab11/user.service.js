import fs from 'fs/promises';

const INIT_SQL_URL = new URL('../../sql/lab11/init.sql', import.meta.url);
let ready = null;

function sanitizeUser(row, { includePrivate = false } = {}) {
    if (!row) {
        return null;
    }

    const user = {
        id: Number(row.id),
        login: row.login,
        full_name: row.full_name || '',
        role: row.role_name || row.role,
        created_at: row.created_at,
        updated_at: row.updated_at
    };

    if (includePrivate) {
        user.email = row.email || '';
    }

    return user;
}

function publicUser(row) {
    if (!row) {
        return null;
    }

    return {
        id: Number(row.id),
        login: row.login,
        full_name: row.full_name || '',
        role: row.role_name || row.role
    };
}

function generatePassword(length = 12) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';

    for (let index = 0; index < length; index += 1) {
        password += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return password;
}

const userService = {
    sanitizeUser,
    publicUser,
    generatePassword,

    async ensureReady(db) {
        if (!ready) {
            ready = (async () => {
                const sql = await fs.readFile(INIT_SQL_URL, 'utf8');
                await db.query(sql);
            })();
        }

        return ready;
    },

    async findUserByLogin(db, login) {
        const { rows } = await db.query(
            `SELECT
                u.id,
                u.login,
                u.password_hash,
                u.full_name,
                u.email,
                u.created_at,
                u.updated_at,
                r.name AS role_name
             FROM lab11.users u
             INNER JOIN lab11.roles r ON r.id = u.role_id
             WHERE u.login = $1`,
            [login]
        );

        return rows[0] || null;
    },

    async findUserById(db, id) {
        const { rows } = await db.query(
            `SELECT
                u.id,
                u.login,
                u.password_hash,
                u.full_name,
                u.email,
                u.created_at,
                u.updated_at,
                r.name AS role_name
             FROM lab11.users u
             INNER JOIN lab11.roles r ON r.id = u.role_id
             WHERE u.id = $1`,
            [id]
        );

        return rows[0] || null;
    },

    async getRoleIdByName(db, roleName) {
        const { rows } = await db.query(
            'SELECT id FROM lab11.roles WHERE name = $1',
            [roleName]
        );

        return rows[0] ? Number(rows[0].id) : null;
    },

    async isLoginTaken(db, login, exceptUserId = null) {
        const params = [login];
        let query = 'SELECT 1 FROM lab11.users WHERE login = $1';

        if (exceptUserId) {
            params.push(exceptUserId);
            query += ' AND id <> $2';
        }

        const { rowCount } = await db.query(query, params);
        return rowCount > 0;
    },

    async createUser(db, { login, passwordHash, fullName = '', email = '', role = 'user' }) {
        const roleId = await this.getRoleIdByName(db, role);

        if (!roleId) {
            const error = new Error('Неизвестная роль пользователя.');
            error.statusCode = 400;
            throw error;
        }

        const { rows } = await db.query(
            `INSERT INTO lab11.users (login, password_hash, full_name, email, role_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [login, passwordHash, fullName, email, roleId]
        );

        return this.findUserById(db, rows[0].id);
    },

    async listUsers(db) {
        const { rows } = await db.query(
            `SELECT
                u.id,
                u.login,
                u.full_name,
                u.email,
                u.created_at,
                u.updated_at,
                r.name AS role_name
             FROM lab11.users u
             INNER JOIN lab11.roles r ON r.id = u.role_id
             ORDER BY u.id ASC`
        );

        return rows;
    },

    async updateUser(db, id, { login, fullName = '', email = '', role = 'user' }) {
        const roleId = await this.getRoleIdByName(db, role);

        if (!roleId) {
            const error = new Error('Неизвестная роль пользователя.');
            error.statusCode = 400;
            throw error;
        }

        const { rowCount } = await db.query(
            `UPDATE lab11.users
             SET login = $1,
                 full_name = $2,
                 email = $3,
                 role_id = $4,
                 updated_at = NOW()
             WHERE id = $5`,
            [login, fullName, email, roleId, id]
        );

        if (!rowCount) {
            return null;
        }

        return this.findUserById(db, id);
    },

    async deleteUser(db, id) {
        const { rowCount } = await db.query(
            'DELETE FROM lab11.users WHERE id = $1',
            [id]
        );

        return rowCount > 0;
    },

    async updatePasswordHash(db, id, passwordHash) {
        const { rowCount } = await db.query(
            `UPDATE lab11.users
             SET password_hash = $1,
                 updated_at = NOW()
             WHERE id = $2`,
            [passwordHash, id]
        );

        return rowCount > 0;
    }
};

export default userService;
