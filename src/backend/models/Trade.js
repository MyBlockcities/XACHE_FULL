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

class Trade {
    static async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS trades (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                trading_pair VARCHAR(20) NOT NULL,
                side VARCHAR(10) NOT NULL,
                quantity DECIMAL(20, 8) NOT NULL,
                price DECIMAL(20, 8) NOT NULL,
                total DECIMAL(20, 8) NOT NULL,
                fee DECIMAL(20, 8) NOT NULL,
                fee_currency VARCHAR(10) NOT NULL,
                maker BOOLEAN NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                trade_id VARCHAR(100),
                counterparty_id INTEGER REFERENCES users(id),
                counterparty_order_id INTEGER REFERENCES orders(id),
                pnl DECIMAL(20, 8),
                pnl_currency VARCHAR(10),
                leverage DECIMAL(5, 2),
                liquidation BOOLEAN DEFAULT FALSE,
                metadata JSONB DEFAULT '{}'::jsonb,
                CONSTRAINT valid_side CHECK (
                    side IN ('buy', 'sell')
                )
            );

            CREATE INDEX IF NOT EXISTS idx_trades_order ON trades(order_id);
            CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
            CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(trading_pair);
            CREATE INDEX IF NOT EXISTS idx_trades_executed ON trades(executed_at);
            CREATE INDEX IF NOT EXISTS idx_trades_counterparty ON trades(counterparty_id);
        `;

        try {
            await pool.query(createTableQuery);
            console.log('Trades table created successfully');
        } catch (error) {
            console.error('Error creating trades table:', error);
            throw error;
        }
    }

    static async create(tradeData) {
        const {
            orderId,
            userId,
            tradingPair,
            side,
            quantity,
            price,
            fee,
            feeCurrency,
            maker,
            tradeId,
            counterpartyId,
            counterpartyOrderId,
            pnl,
            pnlCurrency,
            leverage,
            liquidation,
            metadata
        } = tradeData;

        const total = quantity * price;

        const query = `
            INSERT INTO trades (
                order_id, user_id, trading_pair, side,
                quantity, price, total, fee, fee_currency,
                maker, trade_id, counterparty_id,
                counterparty_order_id, pnl, pnl_currency,
                leverage, liquidation, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *;
        `;

        try {
            const result = await pool.query(query, [
                orderId, userId, tradingPair, side,
                quantity, price, total, fee, feeCurrency,
                maker, tradeId, counterpartyId,
                counterpartyOrderId, pnl, pnlCurrency,
                leverage, liquidation, JSON.stringify(metadata || {})
            ]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating trade:', error);
            throw error;
        }
    }

    static async findById(id) {
        const query = `
            SELECT t.*, o.order_type, o.status as order_status
            FROM trades t
            JOIN orders o ON t.order_id = o.id
            WHERE t.id = $1;
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByOrderId(orderId) {
        const query = `
            SELECT * FROM trades 
            WHERE order_id = $1 
            ORDER BY executed_at DESC;
        `;
        const result = await pool.query(query, [orderId]);
        return result.rows;
    }

    static async findByUserId(userId, options = {}) {
        const {
            limit = 20,
            offset = 0,
            tradingPair,
            side,
            startDate,
            endDate,
            orderBy = 'executed_at',
            orderDir = 'DESC'
        } = options;

        let query = `
            SELECT t.*, o.order_type, o.status as order_status
            FROM trades t
            JOIN orders o ON t.order_id = o.id
            WHERE t.user_id = $1
        `;
        const values = [userId];
        let paramCount = 2;

        if (tradingPair) {
            query += ` AND t.trading_pair = $${paramCount}`;
            values.push(tradingPair);
            paramCount++;
        }

        if (side) {
            query += ` AND t.side = $${paramCount}`;
            values.push(side);
            paramCount++;
        }

        if (startDate) {
            query += ` AND t.executed_at >= $${paramCount}`;
            values.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND t.executed_at <= $${paramCount}`;
            values.push(endDate);
            paramCount++;
        }

        // Validate and sanitize order by field
        const validOrderByFields = ['executed_at', 'price', 'quantity', 'total'];
        const sanitizedOrderBy = validOrderByFields.includes(orderBy) ? orderBy : 'executed_at';
        
        // Validate order direction
        const sanitizedOrderDir = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY t.${sanitizedOrderBy} ${sanitizedOrderDir}`;
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getTradeStats(userId, options = {}) {
        const {
            tradingPair,
            startDate,
            endDate,
            side
        } = options;

        let query = `
            SELECT 
                COUNT(*) as total_trades,
                SUM(quantity) as total_quantity,
                SUM(total) as total_value,
                SUM(fee) as total_fees,
                SUM(CASE WHEN pnl IS NOT NULL THEN pnl ELSE 0 END) as total_pnl,
                AVG(price) as average_price,
                trading_pair,
                side
            FROM trades
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
            query += ` AND executed_at >= $${paramCount}`;
            values.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND executed_at <= $${paramCount}`;
            values.push(endDate);
            paramCount++;
        }

        if (side) {
            query += ` AND side = $${paramCount}`;
            values.push(side);
            paramCount++;
        }

        query += ` GROUP BY trading_pair, side`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getRecentTrades(tradingPair, limit = 100) {
        const query = `
            SELECT * FROM trades 
            WHERE trading_pair = $1 
            ORDER BY executed_at DESC 
            LIMIT $2;
        `;
        const result = await pool.query(query, [tradingPair, limit]);
        return result.rows;
    }

    static async getPriceHistory(tradingPair, interval, startTime, endTime) {
        const query = `
            SELECT 
                time_bucket($1, executed_at) AS bucket,
                first(price, executed_at) AS open,
                max(price) AS high,
                min(price) AS low,
                last(price, executed_at) AS close,
                sum(quantity) AS volume
            FROM trades
            WHERE trading_pair = $2
                AND executed_at >= $3
                AND executed_at <= $4
            GROUP BY bucket
            ORDER BY bucket ASC;
        `;
        
        const result = await pool.query(query, [interval, tradingPair, startTime, endTime]);
        return result.rows;
    }

    static async updateMetadata(id, metadata) {
        const query = `
            UPDATE trades 
            SET metadata = metadata || $1::jsonb, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING *;
        `;
        
        const result = await pool.query(query, [JSON.stringify(metadata), id]);
        return result.rows[0];
    }
}

module.exports = Trade; 