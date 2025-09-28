import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Schedule,
  Payment,
  Security,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';

const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      setLoading(true);

      // Get transaction ID from URL params or PhonePe response
      const transactionId = searchParams.get('transactionId') || 
                           searchParams.get('merchantTransactionId');

      if (!transactionId) {
        setError('Transaction ID not found');
        setPaymentStatus('failed');
        return;
      }

      // Verify payment with backend
      const response = await paymentService.verifyPayment(transactionId);

      if (response.success) {
        if (response.paymentStatus === 'COMPLETED' && response.code === 'PAYMENT_SUCCESS') {
          setPaymentStatus('success');
          setSubscription(response.subscription);
          
          // Update user context if subscription is active
          if (response.subscription && response.subscription.status === 'Active' && user && user._id) {
            updateUser({
              ...user,
              membershipType: response.subscription.planType,
              membershipExpiry: response.subscription.endDate
            });
          }
        } else {
          setPaymentStatus('failed');
          setError('Payment was not successful');
        }
      } else {
        setPaymentStatus('failed');
        setError('Payment verification failed');
      }
    } catch (err: any) {
      setError(err.message);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />;
      case 'failed':
        return <Error sx={{ fontSize: 60, color: 'error.main' }} />;
      default:
        return <Schedule sx={{ fontSize: 60, color: 'warning.main' }} />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Processing Payment...';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Verifying your payment...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="md">
        <Card elevation={4}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            {/* Status Icon */}
            <Box sx={{ mb: 4 }}>
              {getStatusIcon()}
            </Box>

            {/* Status Text */}
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color={`${getStatusColor()}.main`}
              gutterBottom
            >
              {getStatusText()}
            </Typography>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            {/* Success Message */}
            {paymentStatus === 'success' && subscription && (
              <Box sx={{ mb: 4 }}>
                <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    Welcome to {subscription.planType}!
                  </Typography>
                  <Typography variant="body2">
                    Your subscription is now active and you can enjoy all premium features.
                  </Typography>
                </Alert>

                {/* Subscription Details */}
                <Card variant="outlined" sx={{ textAlign: 'left', mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Subscription Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Payment />
                        </ListItemIcon>
                        <ListItemText
                          primary="Plan"
                          secondary={`${subscription.planType} - ${subscription.duration}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Security />
                        </ListItemIcon>
                        <ListItemText
                          primary="Amount Paid"
                          secondary={`₹${subscription.price.toLocaleString()}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle />
                        </ListItemIcon>
                        <ListItemText
                          primary="Status"
                          secondary={
                            <Chip 
                              label={subscription.status} 
                              color="success" 
                              size="small" 
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                {/* Premium Features */}
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    Your Premium Features:
                  </Typography>
                  <List dense>
                    {subscription.features.contactsPerDay > 0 && (
                      <ListItem>
                        <ListItemText
                          primary={`${subscription.features.contactsPerDay} contacts per day`}
                        />
                      </ListItem>
                    )}
                    {subscription.features.messagesPerDay > 0 && (
                      <ListItem>
                        <ListItemText
                          primary={`${subscription.features.messagesPerDay} messages per day`}
                        />
                      </ListItem>
                    )}
                    {subscription.features.profileViews && (
                      <ListItem>
                        <ListItemText primary="Profile view analytics" />
                      </ListItem>
                    )}
                    {subscription.features.advancedSearch && (
                      <ListItem>
                        <ListItemText primary="Advanced search filters" />
                      </ListItem>
                    )}
                    {subscription.features.prioritySupport && (
                      <ListItem>
                        <ListItemText primary="Priority customer support" />
                      </ListItem>
                    )}
                    {subscription.features.profileHighlight && (
                      <ListItem>
                        <ListItemText primary="Profile highlighted in search" />
                      </ListItem>
                    )}
                  </List>
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {paymentStatus === 'success' ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/search')}
                    sx={{ px: 4 }}
                  >
                    Start Searching
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/profile')}
                    sx={{ px: 4 }}
                  >
                    View Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/subscription')}
                    sx={{ px: 4 }}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{ px: 4 }}
                  >
                    Go Home
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PaymentCallbackPage;

