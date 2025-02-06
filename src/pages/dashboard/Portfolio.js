import React, { useState } from 'react';
import { Grid, Card, Typography, Box, Tabs, Tab } from '@mui/material';
import { AssetDistribution } from '../../components/portfolio/AssetDistribution';
import { BalanceHistory } from '../../components/portfolio/BalanceHistory';
import { AssetDetails } from '../../components/portfolio/AssetDetails';
import { PnLTracker } from '../../components/portfolio/PnLTracker';
import { PerformanceAnalytics } from '../../components/portfolio/PerformanceAnalytics';
import { ExportButton } from '../../components/common/ExportButton';

const Portfolio = () => {
  const [timeRange, setTimeRange] = useState('1M'); // 1D, 1W, 1M, 3M, 1Y, ALL
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Portfolio</Typography>
        <ExportButton 
          data="portfolio"
          filename="portfolio-report"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Asset Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Asset Distribution</Typography>
            <AssetDistribution onAssetSelect={handleAssetSelect} />
          </Card>
        </Grid>

        {/* PnL Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Profit & Loss</Typography>
            <PnLTracker timeRange={timeRange} />
          </Card>
        </Grid>

        {/* Balance History */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Balance History</Typography>
              <Tabs
                value={timeRange}
                onChange={handleTimeRangeChange}
                sx={{ minHeight: 'auto' }}
              >
                <Tab label="1D" value="1D" />
                <Tab label="1W" value="1W" />
                <Tab label="1M" value="1M" />
                <Tab label="3M" value="3M" />
                <Tab label="1Y" value="1Y" />
                <Tab label="ALL" value="ALL" />
              </Tabs>
            </Box>
            <BalanceHistory timeRange={timeRange} />
          </Card>
        </Grid>

        {/* Asset Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Asset Details</Typography>
            <AssetDetails 
              selectedAsset={selectedAsset}
              timeRange={timeRange}
            />
          </Card>
        </Grid>

        {/* Performance Analytics */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Performance Analytics</Typography>
            <PerformanceAnalytics 
              selectedAsset={selectedAsset}
              timeRange={timeRange}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Portfolio; 