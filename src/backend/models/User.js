const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl
});

class User {
    static async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                is_verified BOOLEAN DEFAULT FALSE,
                is_2fa_enabled BOOLEAN DEFAULT FALSE,
                two_factor_secret VARCHAR(255),
                api_key VARCHAR(255),
                api_secret VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP WITH TIME ZONE,
                status VARCHAR(50) DEFAULT 'active',
                role VARCHAR(50) DEFAULT 'user',
                preferences JSONB DEFAULT '{}'::jsonb,
                risk_level VARCHAR(50) DEFAULT 'medium',
                trading_enabled BOOLEAN DEFAULT FALSE,
                withdrawal_limit DECIMAL(20, 8) DEFAULT 0,
                kyc_status VARCHAR(50) DEFAULT 'pending',
                kyc_documents JSONB DEFAULT '[]'::jsonb,
                notification_settings JSONB DEFAULT '{
                    "email": true,
                    "sms": false,
                    "push": true,
                    "trade_confirmation": true,
                    "withdrawal_alert": true,
                    "price_alert": true
                }'::jsonb
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
            CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
        `;

        try {
            await pool.query(createTableQuery);
            console.log('Users table created successfully');
        } catch (error) {
            console.error('Error creating users table:', error);
            throw error;
        }
    }

    static async create(userData) {
        const { email, password, firstName, lastName } = userData;
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
        
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, first_name, last_name, created_at;
        `;
        
        try {
            const result = await pool.query(query, [email, passwordHash, firstName, lastName]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async updateProfile(id, updateData) {
        const allowedUpdates = [
            'first_name',
            'last_name',
            'notification_settings',
            'preferences',
            'risk_level'
        ];

        const updates = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates.push(`${key} = $${paramCount}`);
                values.push(updateData[key]);
                paramCount++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE users 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $${paramCount}
            RETURNING *;
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async updatePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
        const query = `
            UPDATE users 
            SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING id;
        `;
        
        const result = await pool.query(query, [passwordHash, id]);
        return result.rows[0];
    }

    static async updateLoginTimestamp(id) {
        const query = `
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP 
            WHERE id = $1;
        `;
        await pool.query(query, [id]);
    }

    static async enable2FA(id, secret) {
        const query = `
            UPDATE users 
            SET is_2fa_enabled = true, two_factor_secret = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING id;
        `;
        
        const result = await pool.query(query, [secret, id]);
        return result.rows[0];
    }

    static async disable2FA(id) {
        const query = `
            UPDATE users 
            SET is_2fa_enabled = false, two_factor_secret = NULL, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1
            RETURNING id;
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async verifyEmail(id) {
        const query = `
            UPDATE users 
            SET is_verified = true, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1
            RETURNING id;
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async updateKYCStatus(id, status, documents = []) {
        const query = `
            UPDATE users 
            SET kyc_status = $1, kyc_documents = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3
            RETURNING id, kyc_status;
        `;
        
        const result = await pool.query(query, [status, JSON.stringify(documents), id]);
        return result.rows[0];
    }

    static async setWithdrawalLimit(id, limit) {
        const query = `
            UPDATE users 
            SET withdrawal_limit = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING id, withdrawal_limit;
        `;
        
        const result = await pool.query(query, [limit, id]);
        return result.rows[0];
    }

    static async toggleTradingStatus(id, enabled) {
        const query = `
            UPDATE users 
            SET trading_enabled = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING id, trading_enabled;
        `;
        
        const result = await pool.query(query, [enabled, id]);
        return result.rows[0];
    }

    static async generateAPIKeys(id) {
        const apiKey = crypto.randomBytes(32).toString('hex');
        const apiSecret = crypto.randomBytes(48).toString('hex');

        const query = `
            UPDATE users 
            SET api_key = $1, api_secret = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3
            RETURNING id, api_key;
        `;
        
        const result = await pool.query(query, [apiKey, apiSecret, id]);
        return {
            apiKey,
            apiSecret,
            userId: result.rows[0].id
        };
    }
}

module.exports = User; 