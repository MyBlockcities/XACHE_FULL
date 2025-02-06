import React, { useState } from 'react';
import { Grid, Card, Typography, Box, Tabs, Tab } from '@mui/material';
import { ProfileSettings } from '../../components/settings/ProfileSettings';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { APISettings } from '../../components/settings/APISettings';
import { PreferenceSettings } from '../../components/settings/PreferenceSettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';
import { ThemeSettings } from '../../components/settings/ThemeSettings';
import { SecurityModal } from '../../components/common/SecurityModal';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityAction, setSecurityAction] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSecurityAction = (action) => {
    setSecurityAction(action);
    setIsSecurityModalOpen(true);
  };

  const handleSecuritySuccess = () => {
    setIsSecurityModalOpen(false);
    // Handle successful security verification
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>

      <Grid container spacing={3}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2 }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              <Tab label="Profile" />
              <Tab label="Security" />
              <Tab label="API Keys" />
              <Tab label="Preferences" />
              <Tab label="Notifications" />
              <Tab label="Theme" />
            </Tabs>
          </Card>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          <Card sx={{ p: 2 }}>
            {/* Profile Settings */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>Profile Settings</Typography>
                <ProfileSettings 
                  onSecurityAction={handleSecurityAction}
                />
              </Box>
            )}

            {/* Security Settings */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>Security Settings</Typography>
                <SecuritySettings 
                  onSecurityAction={handleSecurityAction}
                />
              </Box>
            )}

            {/* API Settings */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>API Keys Management</Typography>
                <APISettings 
                  onSecurityAction={handleSecurityAction}
                />
              </Box>
            )}

            {/* Preferences */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>Preferences</Typography>
                <PreferenceSettings />
              </Box>
            )}

            {/* Notification Settings */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>Notification Settings</Typography>
                <NotificationSettings />
              </Box>
            )}

            {/* Theme Settings */}
            {activeTab === 5 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>Theme Settings</Typography>
                <ThemeSettings />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Security Verification Modal */}
      <SecurityModal
        open={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        actionType={securityAction}
        onSuccess={handleSecuritySuccess}
      />
    </Box>
  );
};

export default Settings; 