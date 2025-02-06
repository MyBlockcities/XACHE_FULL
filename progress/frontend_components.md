# XACHE Frontend Components Structure

## Core Layout Components
- `DashboardLayout`
  - Navigation sidebar
  - Header with user info
  - Notifications area
  - Quick actions menu
  - Content area

## Authentication Pages
1. `Login`
   - Email/password form
   - 2FA verification
   - "Remember me" option
   - Password reset link

2. `Register`
   - Basic info form
   - Email verification
   - Terms acceptance
   - KYC requirements intro

3. `ForgotPassword`
   - Email input
   - Reset instructions
   - Security verification

4. `TwoFactorAuth`
   - QR code setup
   - Backup codes
   - Verification input

## Main Dashboard Pages
1. `Overview` (Home)
   - Portfolio summary
   - Active positions
   - Recent transactions
   - Market overview
   - Performance charts
   - Quick trade widget

2. `Trading`
   - Advanced chart (TradingView integration)
   - Order forms (buy/sell)
   - Order book
   - Recent trades
   - Open orders
   - Position management
   - Trading pairs selector

3. `Portfolio`
   - Asset distribution
   - Balance history
   - Individual asset details
   - PnL tracking
   - Performance analytics
   - Export functionality

4. `Wallets`
   - Wallet balances
   - Deposit interface
   - Withdrawal interface
   - Transaction history
   - Address management
   - Network selection

5. `History`
   - Trade history
   - Order history
   - Transaction history
   - Advanced filtering
   - Export options

6. `Settings`
   - Profile management
   - Security settings
   - API keys management
   - Preferences
   - Notification settings
   - Theme customization

## Reusable Components

### Trading Components
1. `TradingChart`
   - Price chart
   - Technical indicators
   - Time frame selector
   - Drawing tools

2. `OrderForm`
   - Market/limit toggle
   - Price input
   - Amount input
   - Total calculation
   - Order type selector
   - Advanced options

3. `OrderBook`
   - Bid/ask spread
   - Price aggregation
   - Depth visualization
   - Click to trade

4. `TradeHistory`
   - Recent trades list
   - Price/time display
   - Buy/sell indicators

### Portfolio Components
1. `AssetOverview`
   - Total balance
   - 24h change
   - Asset allocation
   - Fiat value

2. `AssetList`
   - Individual assets
   - Balance details
   - Price information
   - Quick actions

3. `PnLCalculator`
   - Realized PnL
   - Unrealized PnL
   - Performance metrics

### Wallet Components
1. `WalletCard`
   - Balance display
   - Quick actions
   - Recent activity

2. `DepositForm`
   - Address display
   - QR code
   - Network selector
   - Instructions

3. `WithdrawalForm`
   - Address input
   - Amount input
   - Fee calculator
   - Security verification

### Utility Components
1. `DataTable`
   - Sortable columns
   - Pagination
   - Filtering
   - Bulk actions

2. `StatusBadge`
   - Order status
   - Transaction status
   - Verification status

3. `PriceTicket`
   - Current price
   - 24h change
   - Sparkline

4. `NotificationCenter`
   - Real-time updates
   - Trade notifications
   - System alerts

5. `SearchBar`
   - Global search
   - Quick navigation
   - Recent searches

## Modal Components
1. `ConfirmationModal`
   - Action confirmation
   - Security verification
   - Risk warnings

2. `TradingViewModal`
   - Full-screen charts
   - Advanced analysis

3. `SecurityModal`
   - 2FA verification
   - Email confirmation
   - Password confirmation

## State Management
1. User State
   - Authentication
   - Preferences
   - Permissions

2. Market State
   - Price data
   - Order book
   - Trading pairs

3. Portfolio State
   - Balances
   - Orders
   - Positions

4. WebSocket State
   - Real-time updates
   - Connection status
   - Event handling

## Next Steps
1. Component Development
   - [ ] Create base components
   - [ ] Implement layouts
   - [ ] Build page structures
   - [ ] Add interactivity

2. Integration
   - [ ] Connect to backend APIs
   - [ ] Implement WebSocket
   - [ ] Add real-time updates
   - [ ] Test data flow

3. Testing
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] Performance testing
   - [ ] User testing 