const { Pool } = require('pg');
const config = require('../config/config');
const crypto = require('crypto');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl
});

class Wallet {
    static async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS wallets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                currency VARCHAR(10) NOT NULL,
                address VARCHAR(255) NOT NULL,
                private_key_encrypted VARCHAR(512),
                balance DECIMAL(20, 8) DEFAULT 0,
                available_balance DECIMAL(20, 8) DEFAULT 0,
                locked_balance DECIMAL(20, 8) DEFAULT 0,
                total_received DECIMAL(20, 8) DEFAULT 0,
                total_sent DECIMAL(20, 8) DEFAULT 0,
                last_transaction_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'active',
                is_primary BOOLEAN DEFAULT FALSE,
                label VARCHAR(100),
                network_type VARCHAR(50),
                memo TEXT,
                UNIQUE(user_id, currency, address)
            );

            CREATE INDEX IF NOT EXISTS idx_wallets_user_currency ON wallets(user_id, currency);
            CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
            CREATE INDEX IF NOT EXISTS idx_wallets_status ON wallets(status);
        `;

        try {
            await pool.query(createTableQuery);
            console.log('Wallets table created successfully');
        } catch (error) {
            console.error('Error creating wallets table:', error);
            throw error;
        }
    }

    static async create(walletData) {
        const {
            userId,
            currency,
            address,
            privateKey,
            networkType,
            label
        } = walletData;

        // Encrypt private key if provided
        let encryptedPrivateKey = null;
        if (privateKey) {
            const cipher = crypto.createCipher('aes-256-cbc', config.security.walletEncryptionKey);
            encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
            encryptedPrivateKey += cipher.final('hex');
        }

        const query = `
            INSERT INTO wallets (
                user_id, currency, address, private_key_encrypted,
                network_type, label, is_primary
            )
            VALUES ($1, $2, $3, $4, $5, $6, 
                NOT EXISTS(SELECT 1 FROM wallets WHERE user_id = $1 AND currency = $2)
            )
            RETURNING id, user_id, currency, address, network_type, label, is_primary, created_at;
        `;

        try {
            const result = await pool.query(query, [
                userId, currency, address, encryptedPrivateKey,
                networkType, label
            ]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Wallet address already exists for this user and currency');
            }
            throw error;
        }
    }

    static async findByUserId(userId) {
        const query = `
            SELECT id, currency, address, balance, available_balance,
                   locked_balance, status, is_primary, label, network_type,
                   last_transaction_at, created_at
            FROM wallets 
            WHERE user_id = $1 
            ORDER BY is_primary DESC, created_at ASC;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async findByAddress(address) {
        const query = `
            SELECT id, user_id, currency, address, balance,
                   available_balance, locked_balance, status,
                   is_primary, label, network_type, last_transaction_at
            FROM wallets 
            WHERE address = $1;
        `;
        const result = await pool.query(query, [address]);
        return result.rows[0];
    }

    static async updateBalance(id, balanceUpdate) {
        const {
            balance,
            availableBalance,
            lockedBalance,
            totalReceived,
            totalSent
        } = balanceUpdate;

        const updates = [];
        const values = [id];
        let paramCount = 2;

        if (balance !== undefined) {
            updates.push(`balance = $${paramCount}`);
            values.push(balance);
            paramCount++;
        }

        if (availableBalance !== undefined) {
            updates.push(`available_balance = $${paramCount}`);
            values.push(availableBalance);
            paramCount++;
        }

        if (lockedBalance !== undefined) {
            updates.push(`locked_balance = $${paramCount}`);
            values.push(lockedBalance);
            paramCount++;
        }

        if (totalReceived !== undefined) {
            updates.push(`total_received = total_received + $${paramCount}`);
            values.push(totalReceived);
            paramCount++;
        }

        if (totalSent !== undefined) {
            updates.push(`total_sent = total_sent + $${paramCount}`);
            values.push(totalSent);
            paramCount++;
        }

        if (updates.length === 0) return null;

        updates.push('last_transaction_at = CURRENT_TIMESTAMP');
        updates.push('updated_at = CURRENT_TIMESTAMP');

        const query = `
            UPDATE wallets 
            SET ${updates.join(', ')}
            WHERE id = $1
            RETURNING *;
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async setPrimary(userId, walletId) {
        // Begin transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Remove primary status from all user's wallets of the same currency
            const walletQuery = 'SELECT currency FROM wallets WHERE id = $1';
            const walletResult = await client.query(walletQuery, [walletId]);
            const currency = walletResult.rows[0].currency;

            await client.query(
                'UPDATE wallets SET is_primary = false WHERE user_id = $1 AND currency = $2',
                [userId, currency]
            );

            // Set new primary wallet
            const query = `
                UPDATE wallets 
                SET is_primary = true, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 AND user_id = $2
                RETURNING *;
            `;
            const result = await client.query(query, [walletId, userId]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateLabel(id, userId, label) {
        const query = `
            UPDATE wallets 
            SET label = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 AND user_id = $3
            RETURNING *;
        `;
        
        const result = await pool.query(query, [label, id, userId]);
        return result.rows[0];
    }

    static async getDecryptedPrivateKey(id, userId) {
        const query = `
            SELECT private_key_encrypted 
            FROM wallets 
            WHERE id = $1 AND user_id = $2;
        `;
        
        const result = await pool.query(query, [id, userId]);
        if (!result.rows[0] || !result.rows[0].private_key_encrypted) {
            return null;
        }

        const decipher = crypto.createDecipher('aes-256-cbc', config.security.walletEncryptionKey);
        let decrypted = decipher.update(result.rows[0].private_key_encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    static async deactivate(id, userId) {
        const query = `
            UPDATE wallets 
            SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }
}

module.exports = Wallet; 