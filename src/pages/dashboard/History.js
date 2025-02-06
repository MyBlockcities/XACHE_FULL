import React, { useState } from 'react';
import { Grid, Card, Typography, Box, Tabs, Tab, Button } from '@mui/material';
import { TradeHistory } from '../../components/history/TradeHistory';
import { OrderHistory } from '../../components/history/OrderHistory';
import { TransactionHistory } from '../../components/history/TransactionHistory';
import { HistoryFilter } from '../../components/history/HistoryFilter';
import { ExportButton } from '../../components/common/ExportButton';

const History = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: 'all',
    status: 'all',
    pair: 'all'
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const getExportFilename = () => {
    const type = activeTab === 0 ? 'trades' : activeTab === 1 ? 'orders' : 'transactions';
    return `${type}-history-${new Date().toISOString().split('T')[0]}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">History</Typography>
        <ExportButton 
          data={activeTab === 0 ? 'trades' : activeTab === 1 ? 'orders' : 'transactions'}
          filename={getExportFilename()}
          filters={filters}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <HistoryFilter 
              type={activeTab === 0 ? 'trades' : activeTab === 1 ? 'orders' : 'transactions'}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </Card>
        </Grid>

        {/* History Content */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Trades" />
                <Tab label="Orders" />
                <Tab label="Transactions" />
              </Tabs>
            </Box>

            {/* Trades History */}
            {activeTab === 0 && (
              <TradeHistory 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            )}

            {/* Orders History */}
            {activeTab === 1 && (
              <OrderHistory 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            )}

            {/* Transactions History */}
            {activeTab === 2 && (
              <TransactionHistory 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            )}
          </Card>
        </Grid>

        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {activeTab === 0 ? 'Trading Volume' : 
                   activeTab === 1 ? 'Order Statistics' : 
                   'Transaction Summary'}
                </Typography>
                {/* Add summary component based on active tab */}
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {activeTab === 0 ? 'PnL Summary' :
                   activeTab === 1 ? 'Success Rate' :
                   'Fee Summary'}
                </Typography>
                {/* Add summary component based on active tab */}
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {activeTab === 0 ? 'Top Pairs' :
                   activeTab === 1 ? 'Order Types' :
                   'Transaction Types'}
                </Typography>
                {/* Add summary component based on active tab */}
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default History; 