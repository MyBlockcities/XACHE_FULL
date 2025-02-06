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

class Order {
    static async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                wallet_id INTEGER NOT NULL REFERENCES wallets(id),
                order_type VARCHAR(50) NOT NULL,
                side VARCHAR(10) NOT NULL,
                trading_pair VARCHAR(20) NOT NULL,
                base_currency VARCHAR(10) NOT NULL,
                quote_currency VARCHAR(10) NOT NULL,
                quantity DECIMAL(20, 8) NOT NULL,
                price DECIMAL(20, 8),
                total DECIMAL(20, 8),
                filled_quantity DECIMAL(20, 8) DEFAULT 0,
                remaining_quantity DECIMAL(20, 8),
                average_fill_price DECIMAL(20, 8),
                status VARCHAR(50) DEFAULT 'pending',
                time_in_force VARCHAR(10) DEFAULT 'GTC',
                stop_price DECIMAL(20, 8),
                trigger_price DECIMAL(20, 8),
                leverage DECIMAL(5, 2) DEFAULT 1,
                margin_type VARCHAR(10) DEFAULT 'isolated',
                fee DECIMAL(20, 8) DEFAULT 0,
                fee_currency VARCHAR(10),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP WITH TIME ZONE,
                canceled_at TIMESTAMP WITH TIME ZONE,
                error_message TEXT,
                metadata JSONB DEFAULT '{}'::jsonb,
                CONSTRAINT valid_order_type CHECK (
                    order_type IN ('market', 'limit', 'stop_limit', 'stop_market', 'take_profit', 'take_profit_limit')
                ),
                CONSTRAINT valid_side CHECK (
                    side IN ('buy', 'sell')
                ),
                CONSTRAINT valid_status CHECK (
                    status IN ('pending', 'open', 'partially_filled', 'filled', 'canceled', 'expired', 'rejected')
                ),
                CONSTRAINT valid_time_in_force CHECK (
                    time_in_force IN ('GTC', 'IOC', 'FOK')
                ),
                CONSTRAINT valid_margin_type CHECK (
                    margin_type IN ('isolated', 'cross')
                )
            );

            CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
            CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(wallet_id);
            CREATE INDEX IF NOT EXISTS idx_orders_trading_pair ON orders(trading_pair);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
        `;

        try {
            await pool.query(createTableQuery);
            console.log('Orders table created successfully');
        } catch (error) {
            console.error('Error creating orders table:', error);
            throw error;
        }
    }

    static async create(orderData) {
        const {
            userId,
            walletId,
            orderType,
            side,
            tradingPair,
            baseCurrency,
            quoteCurrency,
            quantity,
            price,
            stopPrice,
            triggerPrice,
            timeInForce,
            leverage,
            marginType,
            metadata
        } = orderData;

        // Calculate total for limit orders
        const total = price ? quantity * price : null;
        const remainingQuantity = quantity;

        const query = `
            INSERT INTO orders (
                user_id, wallet_id, order_type, side,
                trading_pair, base_currency, quote_currency,
                quantity, price, total, remaining_quantity,
                stop_price, trigger_price, time_in_force,
                leverage, margin_type, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *;
        `;

        try {
            const result = await pool.query(query, [
                userId, walletId, orderType, side,
                tradingPair, baseCurrency, quoteCurrency,
                quantity, price, total, remainingQuantity,
                stopPrice, triggerPrice, timeInForce || 'GTC',
                leverage || 1, marginType || 'isolated',
                JSON.stringify(metadata || {})
            ]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    static async findById(id) {
        const query = `
            SELECT * FROM orders 
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
            tradingPair,
            orderType,
            side,
            startDate,
            endDate
        } = options;

        let query = `
            SELECT o.*, w.address as wallet_address, w.label as wallet_label
            FROM orders o
            JOIN wallets w ON o.wallet_id = w.id
            WHERE o.user_id = $1
        `;
        const values = [userId];
        let paramCount = 2;

        if (status) {
            query += ` AND o.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        if (tradingPair) {
            query += ` AND o.trading_pair = $${paramCount}`;
            values.push(tradingPair);
            paramCount++;
        }

        if (orderType) {
            query += ` AND o.order_type = $${paramCount}`;
            values.push(orderType);
            paramCount++;
        }

        if (side) {
            query += ` AND o.side = $${paramCount}`;
            values.push(side);
            paramCount++;
        }

        if (startDate) {
            query += ` AND o.created_at >= $${paramCount}`;
            values.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND o.created_at <= $${paramCount}`;
            values.push(endDate);
            paramCount++;
        }

        query += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async updateStatus(id, updateData) {
        const {
            status,
            filledQuantity,
            remainingQuantity,
            averageFillPrice,
            fee,
            feeCurrency,
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

        if (filledQuantity !== undefined) {
            updates.push(`filled_quantity = $${paramCount}`);
            values.push(filledQuantity);
            paramCount++;
        }

        if (remainingQuantity !== undefined) {
            updates.push(`remaining_quantity = $${paramCount}`);
            values.push(remainingQuantity);
            paramCount++;
        }

        if (averageFillPrice !== undefined) {
            updates.push(`average_fill_price = $${paramCount}`);
            values.push(averageFillPrice);
            paramCount++;
        }

        if (fee !== undefined) {
            updates.push(`fee = $${paramCount}`);
            values.push(fee);
            paramCount++;
        }

        if (feeCurrency) {
            updates.push(`fee_currency = $${paramCount}`);
            values.push(feeCurrency);
            paramCount++;
        }

        if (errorMessage) {
            updates.push(`error_message = $${paramCount}`);
            values.push(errorMessage);
            paramCount++;
        }

        if (status === 'filled') {
            updates.push('completed_at = CURRENT_TIMESTAMP');
        } else if (status === 'canceled') {
            updates.push('canceled_at = CURRENT_TIMESTAMP');
        }

        if (updates.length === 0) return null;

        updates.push('updated_at = CURRENT_TIMESTAMP');

        const query = `
            UPDATE orders 
            SET ${updates.join(', ')}
            WHERE id = $1
            RETURNING *;
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getOrderStats(userId, options = {}) {
        const {
            tradingPair,
            startDate,
            endDate,
            side
        } = options;

        let query = `
            SELECT 
                COUNT(*) as total_count,
                SUM(quantity) as total_quantity,
                SUM(filled_quantity) as total_filled_quantity,
                SUM(fee) as total_fees,
                trading_pair,
                side,
                status
            FROM orders
            WHERE user_id = $1
        `;
        const values = [userId];
        let paramCount = 2;

        if (tradingPair) {
            query += ` AND trading_pair = $${paramCount}`;
            values.push(tradingPair);
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

        if (side) {
            query += ` AND side = $${paramCount}`;
            values.push(side);
            paramCount++;
        }

        query += ` GROUP BY trading_pair, side, status`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async findOpenOrders(tradingPair = null) {
        let query = `
            SELECT * FROM orders 
            WHERE status IN ('pending', 'open', 'partially_filled')
        `;
        const values = [];

        if (tradingPair) {
            query += ` AND trading_pair = $1`;
            values.push(tradingPair);
        }

        query += ` ORDER BY created_at ASC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async cancelOrder(id, userId) {
        const query = `
            UPDATE orders 
            SET status = 'canceled',
                canceled_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND user_id = $2
                AND status IN ('pending', 'open', 'partially_filled')
            RETURNING *;
        `;
        
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    static async updateMetadata(id, metadata) {
        const query = `
            UPDATE orders 
            SET metadata = metadata || $1::jsonb, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING *;
        `;
        
        const result = await pool.query(query, [JSON.stringify(metadata), id]);
        return result.rows[0];
    }
}

module.exports = Order; 