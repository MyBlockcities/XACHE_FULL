const { Pool } = require('pg');
const config = require('../config/config');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl
});

class Transaction {
    static async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                wallet_id INTEGER NOT NULL REFERENCES wallets(id),
                transaction_type VARCHAR(50) NOT NULL,
                currency VARCHAR(10) NOT NULL,
                amount DECIMAL(20, 8) NOT NULL,
                fee DECIMAL(20, 8) DEFAULT 0,
                from_address VARCHAR(255),
                to_address VARCHAR(255),
                blockchain_tx_id VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                confirmations INTEGER DEFAULT 0,
                block_height INTEGER,
                block_hash VARCHAR(255),
                network_type VARCHAR(50),
                memo TEXT,
                error_message TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP WITH TIME ZONE,
                metadata JSONB DEFAULT '{}'::jsonb
            );

            CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
            CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_tx ON transactions(blockchain_tx_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_addresses ON transactions(from_address, to_address);
            CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
        `;

        try {
            await pool.query(createTableQuery);
            console.log('Transactions table created successfully');
        } catch (error) {
            console.error('Error creating transactions table:', error);
            throw error;
        }
    }

    static async create(transactionData) {
        const {
            userId,
            walletId,
            transactionType,
            currency,
            amount,
            fee,
            fromAddress,
            toAddress,
            networkType,
            memo,
            metadata
        } = transactionData;

        const query = `
            INSERT INTO transactions (
                user_id, wallet_id, transaction_type, currency,
                amount, fee, from_address, to_address,
                network_type, memo, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

        try {
            const result = await pool.query(query, [
                userId, walletId, transactionType, currency,
                amount, fee, fromAddress, toAddress,
                networkType, memo, JSON.stringify(metadata || {})
            ]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    }

    static async findById(id) {
        const query = `
            SELECT * FROM transactions 
            WHERE id = $1;
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByUserId(userId, options = {}) {
        const {
            limit = 20,
            offset = 0,
            status,
            transactionType,
            currency,
            startDate,
            endDate
        } = options;

        let query = `
            SELECT t.*, w.address as wallet_address, w.label as wallet_label
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            WHERE t.user_id = $1
        `;
        const values = [userId];
        let paramCount = 2;

        if (status) {
            query += ` AND t.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        if (transactionType) {
            query += ` AND t.transaction_type = $${paramCount}`;
            values.push(transactionType);
            paramCount++;
        }

        if (currency) {
            query += ` AND t.currency = $${paramCount}`;
            values.push(currency);
            paramCount++;
        }

        if (startDate) {
            query += ` AND t.created_at >= $${paramCount}`;
            values.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND t.created_at <= $${paramCount}`;
            values.push(endDate);
            paramCount++;
        }

        query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async updateStatus(id, updateData) {
        const {
            status,
            confirmations,
            blockHeight,
            blockHash,
            blockchainTxId,
            errorMessage
        } = updateData;

        const updates = [];
        const values = [id];
        let paramCount = 2;

        if (status) {
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        if (confirmations !== undefined) {
            updates.push(`confirmations = $${paramCount}`);
            values.push(confirmations);
            paramCount++;
        }

        if (blockHeight) {
            updates.push(`block_height = $${paramCount}`);
            values.push(blockHeight);
            paramCount++;
        }

        if (blockHash) {
            updates.push(`block_hash = $${paramCount}`);
            values.push(blockHash);
            paramCount++;
        }

        if (blockchainTxId) {
            updates.push(`blockchain_tx_id = $${paramCount}`);
            values.push(blockchainTxId);
            paramCount++;
        }

        if (errorMessage) {
            updates.push(`error_message = $${paramCount}`);
            values.push(errorMessage);
            paramCount++;
        }

        if (status === 'completed') {
            updates.push('completed_at = CURRENT_TIMESTAMP');
        }

        if (updates.length === 0) return null;

        updates.push('updated_at = CURRENT_TIMESTAMP');

        const query = `
            UPDATE transactions 
            SET ${updates.join(', ')}
            WHERE id = $1
            RETURNING *;
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getTransactionStats(userId, options = {}) {
        const {
            currency,
            startDate,
            endDate,
            transactionType
        } = options;

        let query = `
            SELECT 
                COUNT(*) as total_count,
                SUM(amount) as total_amount,
                SUM(fee) as total_fees,
                currency,
                transaction_type,
                status
            FROM transactions
            WHERE user_id = $1
        `;
        const values = [userId];
        let paramCount = 2;

        if (currency) {
            query += ` AND currency = $${paramCount}`;
            values.push(currency);
            paramCount++;
        }

        if (startDate) {
            query += ` AND created_at >= $${paramCount}`;
            values.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND created_at <= $${paramCount}`;
            values.push(endDate);
            paramCount++;
        }

        if (transactionType) {
            query += ` AND transaction_type = $${paramCount}`;
            values.push(transactionType);
            paramCount++;
        }

        query += ` GROUP BY currency, transaction_type, status`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async findPendingTransactions() {
        const query = `
            SELECT * FROM transactions 
            WHERE status = 'pending' 
            ORDER BY created_at ASC;
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    static async updateMetadata(id, metadata) {
        const query = `
            UPDATE transactions 
            SET metadata = metadata || $1::jsonb, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING *;
        `;
        
        const result = await pool.query(query, [JSON.stringify(metadata), id]);
        return result.rows[0];
    }
}

module.exports = Transaction; 