require('dotenv').config();

const config = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        apiUrl: process.env.API_URL || 'http://localhost:3000',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'xache_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'noreply@xache.io'
    },
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
        walletEncryptionKey: process.env.WALLET_ENCRYPTION_KEY,
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // limit each IP to 100 requests per windowMs
        }
    },
    trading: {
        defaultFee: parseFloat(process.env.DEFAULT_TRADING_FEE) || 0.001, // 0.1%
        minOrderSize: parseFloat(process.env.MIN_ORDER_SIZE) || 0.0001,
        maxLeverage: parseInt(process.env.MAX_LEVERAGE) || 100,
        supportedPairs: (process.env.SUPPORTED_PAIRS || 'BTC/USDT,ETH/USDT').split(','),
        priceUpdateInterval: parseInt(process.env.PRICE_UPDATE_INTERVAL) || 1000, // 1 second
        orderBookDepth: parseInt(process.env.ORDER_BOOK_DEPTH) || 100
    },
    external: {
        coingecko: {
            apiKey: process.env.COINGECKO_API_KEY,
            apiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
        },
        binance: {
            apiKey: process.env.BINANCE_API_KEY,
            apiSecret: process.env.BINANCE_API_SECRET,
            apiUrl: process.env.BINANCE_API_URL || 'https://api.binance.com'
        }
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/xache.log'
    }
};

// Validate required configuration
const requiredEnvVars = [
    'DB_PASSWORD',
    'JWT_SECRET',
    'WALLET_ENCRYPTION_KEY',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

module.exports = config; 