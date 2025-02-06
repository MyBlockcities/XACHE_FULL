import React, { useState } from 'react';
import { Grid, Card, Typography, Box, Tabs, Tab, Button } from '@mui/material';
import { WalletList } from '../../components/wallet/WalletList';
import { DepositForm } from '../../components/wallet/DepositForm';
import { WithdrawalForm } from '../../components/wallet/WithdrawalForm';
import { TransactionHistory } from '../../components/wallet/TransactionHistory';
import { AddressBook } from '../../components/wallet/AddressBook';
import { NetworkSelector } from '../../components/wallet/NetworkSelector';
import { SecurityModal } from '../../components/common/SecurityModal';

const Wallets = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handleAction = (type) => {
    setActionType(type);
    setIsSecurityModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Wallets</Typography>

      <Grid container spacing={3}>
        {/* Wallet List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>My Wallets</Typography>
            <WalletList 
              onWalletSelect={handleWalletSelect}
              selectedWallet={selectedWallet}
            />
          </Card>

          {/* Network Selector */}
          <Card sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Networks</Typography>
            <NetworkSelector 
              wallet={selectedWallet}
            />
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Deposit" />
                <Tab label="Withdraw" />
                <Tab label="History" />
                <Tab label="Address Book" />
              </Tabs>
            </Box>

            {/* Deposit Form */}
            {activeTab === 0 && (
              <Box>
                <DepositForm 
                  wallet={selectedWallet}
                />
              </Box>
            )}

            {/* Withdrawal Form */}
            {activeTab === 1 && (
              <Box>
                <WithdrawalForm 
                  wallet={selectedWallet}
                  onWithdraw={() => handleAction('withdraw')}
                />
              </Box>
            )}

            {/* Transaction History */}
            {activeTab === 2 && (
              <Box>
                <TransactionHistory 
                  wallet={selectedWallet}
                />
              </Box>
            )}

            {/* Address Book */}
            {activeTab === 3 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => handleAction('addAddress')}
                  >
                    Add New Address
                  </Button>
                </Box>
                <AddressBook 
                  wallet={selectedWallet}
                  onAddressSelect={(address) => {
                    setActiveTab(1);
                    // Pre-fill withdrawal form with selected address
                  }}
                />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Security Verification Modal */}
      <SecurityModal
        open={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        actionType={actionType}
        onSuccess={() => {
          setIsSecurityModalOpen(false);
          // Handle successful verification
        }}
      />
    </Box>
  );
};

export default Wallets; 