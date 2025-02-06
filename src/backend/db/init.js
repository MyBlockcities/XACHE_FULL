const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction');

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        // Create tables in order of dependencies
        console.log('Creating Users table...');
        await User.createTable();

        console.log('Creating Wallets table...');
        await Wallet.createTable();

        console.log('Creating Orders table...');
        await Order.createTable();

        console.log('Creating Trades table...');
        await Trade.createTable();

        console.log('Creating Transactions table...');
        await Transaction.createTable();

        console.log('Database initialization completed successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

// Run initialization if this script is run directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase; 