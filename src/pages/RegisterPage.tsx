import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Favorite,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = ['Basic Info', 'Personal Details', 'Location & Preferences'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Basic Info
    profileCreatedFor: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Step 2 - Personal Details
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    religion: '',
    motherTongue: '',
    height: '',
    education: '',
    occupation: '',
    
    // Step 3 - Location & Preferences
    country: '',
    state: '',
    city: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step: number) => {
    const errors: { [key: string]: string } = {};

    if (step === 0) {
      if (!formData.profileCreatedFor) errors.profileCreatedFor = 'Please select who this profile is for';
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      if (!formData.phone) errors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone)) errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (step === 1) {
      if (!formData.gender) errors.gender = 'Gender is required';
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!formData.maritalStatus) errors.maritalStatus = 'Marital status is required';
      if (!formData.religion) errors.religion = 'Religion is required';
      if (!formData.motherTongue) errors.motherTongue = 'Mother tongue is required';
      if (!formData.height) errors.height = 'Height is required';
      if (!formData.education) errors.education = 'Education is required';
      if (!formData.occupation) errors.occupation = 'Occupation is required';
    }

    if (step === 2) {
      if (!formData.country) errors.country = 'Country is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.city) errors.city = 'City is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
      navigate('/profile');
    } catch (err) {
      // Error is handled by context
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormControl fullWidth error={!!formErrors.profileCreatedFor}>
                <InputLabel>This profile is for</InputLabel>
                <Select
                  name="profileCreatedFor"
                  value={formData.profileCreatedFor}
                  label="This profile is for"
                  onChange={(e) => handleChange({ target: { name: 'profileCreatedFor', value: e.target.value } } as any)}
                >
                  <MenuItem value="Self">Myself</MenuItem>
                  <MenuItem value="Son">My Son</MenuItem>
                  <MenuItem value="Daughter">My Daughter</MenuItem>
                  <MenuItem value="Brother">My Brother</MenuItem>
                  <MenuItem value="Sister">My Sister</MenuItem>
                  <MenuItem value="Friend">My Friend</MenuItem>
                  <MenuItem value="Relative">My Relative</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormControl component="fieldset" error={!!formErrors.gender}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                name="dateOfBirth"
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={!!formErrors.dateOfBirth}
                helperText={formErrors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth error={!!formErrors.maritalStatus}>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  label="Marital Status"
                  onChange={(e) => handleChange({ target: { name: 'maritalStatus', value: e.target.value } } as any)}
                >
                  <MenuItem value="Never Married">Never Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                  <MenuItem value="Awaiting Divorce">Awaiting Divorce</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth error={!!formErrors.religion}>
                <InputLabel>Religion</InputLabel>
                <Select
                  name="religion"
                  value={formData.religion}
                  label="Religion"
                  onChange={(e) => handleChange({ target: { name: 'religion', value: e.target.value } } as any)}
                >
                  <MenuItem value="Hindu">Hindu</MenuItem>
                  <MenuItem value="Muslim">Muslim</MenuItem>
                  <MenuItem value="Christian">Christian</MenuItem>
                  <MenuItem value="Sikh">Sikh</MenuItem>
                  <MenuItem value="Buddhist">Buddhist</MenuItem>
                  <MenuItem value="Jain">Jain</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth error={!!formErrors.motherTongue}>
                <InputLabel>Mother Tongue</InputLabel>
                <Select
                  name="motherTongue"
                  value={formData.motherTongue}
                  label="Mother Tongue"
                  onChange={(e) => handleChange({ target: { name: 'motherTongue', value: e.target.value } } as any)}
                >
                  <MenuItem value="Hindi">Hindi</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Tamil">Tamil</MenuItem>
                  <MenuItem value="Telugu">Telugu</MenuItem>
                  <MenuItem value="Bengali">Bengali</MenuItem>
                  <MenuItem value="Marathi">Marathi</MenuItem>
                  <MenuItem value="Gujarati">Gujarati</MenuItem>
                  <MenuItem value="Punjabi">Punjabi</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                name="height"
                label="Height (e.g., 5'6&quot;)"
                value={formData.height}
                onChange={handleChange}
                error={!!formErrors.height}
                helperText={formErrors.height}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                name="education"
                label="Education"
                value={formData.education}
                onChange={handleChange}
                error={!!formErrors.education}
                helperText={formErrors.education}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                name="occupation"
                label="Occupation"
                value={formData.occupation}
                onChange={handleChange}
                error={!!formErrors.occupation}
                helperText={formErrors.occupation}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <FormControl fullWidth error={!!formErrors.country}>
                <InputLabel>Country</InputLabel>
                <Select
                  name="country"
                  value={formData.country}
                  label="Country"
                  onChange={(e) => handleChange({ target: { name: 'country', value: e.target.value } } as any)}
                >
                  <MenuItem value="India">India</MenuItem>
                  <MenuItem value="USA">USA</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                  <MenuItem value="UK">UK</MenuItem>
                  <MenuItem value="Australia">Australia</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <TextField
                fullWidth
                name="state"
                label="State"
                value={formData.state}
                onChange={handleChange}
                error={!!formErrors.state}
                helperText={formErrors.state}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                error={!!formErrors.city}
                helperText={formErrors.city}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F3426A 0%, #FF7A9D 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Favorite sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              Join Matrimony Test
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your profile to find your perfect match
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Form Content */}
          <Box sx={{ mb: 4 }}>
            {renderStep()}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                color="primary"
              >
                Already have an account?
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;