import React, { useState } from 'react';
import { Grid, Card, Box, Tabs, Tab } from '@mui/material';
import { TradingViewChart } from '../../components/trading/TradingViewChart';
import { OrderForm } from '../../components/trading/OrderForm';
import { OrderBook } from '../../components/trading/OrderBook';
import { TradeHistory } from '../../components/trading/TradeHistory';
import { OpenOrders } from '../../components/trading/OpenOrders';
import { PositionManager } from '../../components/trading/PositionManager';
import { TradingPairSelector } from '../../components/trading/TradingPairSelector';

const Trading = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handlePairChange = (pair) => {
    setSelectedPair(pair);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {/* Trading Pair Selector */}
        <Grid item xs={12}>
          <Card sx={{ p: 2, mb: 2 }}>
            <TradingPairSelector 
              selectedPair={selectedPair}
              onPairChange={handlePairChange}
            />
          </Card>
        </Grid>

        {/* Main Trading Area */}
        <Grid item xs={12} lg={9}>
          <Card sx={{ p: 2, mb: 2 }}>
            <TradingViewChart 
              symbol={selectedPair}
              interval="1h"
            />
          </Card>

          {/* Order Book and Trade History */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <OrderBook pair={selectedPair} />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <TradeHistory pair={selectedPair} />
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Trading Panel */}
        <Grid item xs={12} lg={3}>
          <Card sx={{ p: 2 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab label="Spot" />
              <Tab label="Margin" />
            </Tabs>

            <OrderForm 
              pair={selectedPair}
              type={selectedTab === 0 ? 'spot' : 'margin'}
            />
          </Card>

          {/* Open Orders */}
          <Card sx={{ p: 2, mt: 2 }}>
            <OpenOrders pair={selectedPair} />
          </Card>

          {/* Position Manager (visible only for margin trading) */}
          {selectedTab === 1 && (
            <Card sx={{ p: 2, mt: 2 }}>
              <PositionManager pair={selectedPair} />
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Trading; 