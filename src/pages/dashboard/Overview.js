import React from 'react';
import { Grid, Card, Typography, Box } from '@mui/material';
import { PortfolioSummary } from '../../components/portfolio/PortfolioSummary';
import { ActivePositions } from '../../components/trading/ActivePositions';
import { RecentTransactions } from '../../components/transactions/RecentTransactions';
import { MarketOverview } from '../../components/market/MarketOverview';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { QuickTradeWidget } from '../../components/trading/QuickTradeWidget';

const Overview = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3}>
        {/* Portfolio Summary */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 2, height: '100%' }}>
            <PortfolioSummary />
          </Card>
        </Grid>

        {/* Quick Trade Widget */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <QuickTradeWidget />
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <PerformanceChart />
          </Card>
        </Grid>

        {/* Active Positions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Active Positions</Typography>
            <ActivePositions />
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Transactions</Typography>
            <RecentTransactions />
          </Card>
        </Grid>

        {/* Market Overview */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Market Overview</Typography>
            <MarketOverview />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 