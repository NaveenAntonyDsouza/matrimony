import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  Check,
  Star,
  Security,
  Speed,
  Support,
  Visibility,
  Search,
  Favorite,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';

interface SubscriptionPlan {
  type: string;
  duration: string;
  price: number;
  features: {
    contactsPerDay: number;
    messagesPerDay: number;
    profileViews: boolean;
    advancedSearch: boolean;
    prioritySupport: boolean;
    profileHighlight: boolean;
  };
}

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPlans();
  }, [isAuthenticated, navigate]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getSubscriptionPlans();
      setPlans(response.plans);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentDialog(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);
      const response = await paymentService.createPaymentOrder({
        planType: selectedPlan.type as 'Premium' | 'Premium Plus',
        duration: selectedPlan.duration as any,
      });

      // Redirect to PhonePe payment page
      window.location.href = response.paymentUrl;
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'contactsPerDay':
        return <Favorite />;
      case 'messagesPerDay':
        return <Speed />;
      case 'profileViews':
        return <Visibility />;
      case 'advancedSearch':
        return <Search />;
      case 'prioritySupport':
        return <Support />;
      case 'profileHighlight':
        return <Star />;
      default:
        return <Check />;
    }
  };

  const getFeatureText = (feature: string, value: any) => {
    switch (feature) {
      case 'contactsPerDay':
        return `${value} contacts per day`;
      case 'messagesPerDay':
        return `${value} messages per day`;
      case 'profileViews':
        return value ? 'Profile view analytics' : 'No profile analytics';
      case 'advancedSearch':
        return value ? 'Advanced search filters' : 'Basic search only';
      case 'prioritySupport':
        return value ? 'Priority customer support' : 'Standard support';
      case 'profileHighlight':
        return value ? 'Profile highlighted in search' : 'Standard profile';
      default:
        return value ? 'Enabled' : 'Disabled';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Unlock premium features to find your perfect match faster
          </Typography>
          
          {user?.membershipType !== 'Free' && (
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              You currently have a {user?.membershipType} subscription
            </Alert>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Plans Grid */}
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid
              key={index}
              size={{
                xs: 12,
                md: 6,
                lg: 4
              }}>
              <Card
                elevation={plan.type === 'Premium Plus' ? 8 : 2}
                sx={{
                  height: '100%',
                  position: 'relative',
                  border: plan.type === 'Premium Plus' ? `2px solid ${theme.palette.primary.main}` : 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                {plan.type === 'Premium Plus' && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Plan Header */}
                  <Box textAlign="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {plan.type}
                    </Typography>
                    <Typography variant="h3" color="primary" fontWeight="bold">
                      ₹{plan.price.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {plan.duration}
                    </Typography>
                  </Box>

                  {/* Features */}
                  <List sx={{ flexGrow: 1 }}>
                    {Object.entries(plan.features).map(([feature, value]) => (
                      <ListItem key={feature} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getFeatureIcon(feature)}
                        </ListItemIcon>
                        <ListItemText
                          primary={getFeatureText(feature, value)}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            color: value ? 'text.primary' : 'text.secondary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Action Button */}
                  <Button
                    fullWidth
                    variant={plan.type === 'Premium Plus' ? 'contained' : 'outlined'}
                    size="large"
                    onClick={() => handleSelectPlan(plan)}
                    sx={{ mt: 2, py: 1.5 }}
                  >
                    {user?.membershipType === plan.type ? 'Current Plan' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Benefits Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Why Choose Premium?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <Box sx={{ textAlign: 'center' }}>
                <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Secure & Private
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your personal information is protected with bank-level security
                </Typography>
              </Box>
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <Box sx={{ textAlign: 'center' }}>
                <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Faster Matching
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get priority in search results and faster responses
                </Typography>
              </Box>
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <Box sx={{ textAlign: 'center' }}>
                <Support sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Premium Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get dedicated support for all your matrimony needs
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Your Subscription
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPlan.type} - {selectedPlan.duration}
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ₹{selectedPlan.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                You will be redirected to PhonePe for secure payment processing.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPage;

