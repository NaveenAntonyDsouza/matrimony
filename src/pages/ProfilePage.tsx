import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import {
  Edit,
  Visibility,
  Message,
  Favorite,
  Star,
  LocationOn,
  Work,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Summary Card */}
        <Grid>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                src={user.photos?.find(p => p.isProfile)?.url}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  fontSize: '3rem'
                }}
              >
                {user.firstName?.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.occupation || 'Occupation not specified'}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Grid>
                  <Chip 
                    icon={<Star />} 
                    label={`${user.profileViews || 0} views`} 
                    variant="outlined" 
                    size="small" 
                  />
                </Grid>
                <Grid>
                  <Chip 
                    label="Online" 
                    color="success" 
                    size="small" 
                  />
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2} textAlign="center">
                <Grid>
                  <Typography variant="h6" color="primary">
                    {user.profileViews || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Profile Views
                  </Typography>
                </Grid>
                <Grid>
                  <Typography variant="h6" color="primary">
                    0
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Interests
                  </Typography>
                </Grid>
              </Grid>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<Edit />}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid>
                      <Typography variant="body2" color="text.secondary">
                        Age
                      </Typography>
                      <Typography variant="body1">
                        {user.dateOfBirth ? 
                          new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() 
                          : 'Not specified'
                        } years
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" color="text.secondary">
                        Height
                      </Typography>
                      <Typography variant="body1">
                        {user.height || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" color="text.secondary">
                        Marital Status
                      </Typography>
                      <Typography variant="body1">
                        {user.maritalStatus || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="body2" color="text.secondary">
                        Religion
                      </Typography>
                      <Typography variant="body1">
                        {user.religion || 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Location */}
            <Grid>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Location
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {[user.city, user.state, user.country].filter(Boolean).join(', ') || 'Not specified'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Education & Career */}
            <Grid>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Work color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Career
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Education
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user.education || 'Not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Occupation
                  </Typography>
                  <Typography variant="body1">
                    {user.occupation || 'Not specified'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* About Me */}
            <Grid>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    About Me
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.aboutMe || 'No description added yet. Click edit profile to add more details about yourself.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="outlined" startIcon={<Visibility />}>
                    View as Others See
                  </Button>
                  <Button variant="outlined" startIcon={<Message />}>
                    Upgrade to Contact
                  </Button>
                  <Button variant="outlined" startIcon={<Favorite />}>
                    Add to Shortlist
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;