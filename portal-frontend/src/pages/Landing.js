import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Campus Lost and Found Portal
          </Typography>
          <Typography variant="h5" gutterBottom>
            Secure. Simple. Track and recover lost items easily.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{ mr: 2, backgroundColor: '#fff', color: '#1976d2' }}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
            <Button
              variant="contained"
              size="large"
              sx={{ mr: 2, backgroundColor: '#fff', color: '#1976d2' }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ backgroundColor: 'transparent', color: '#fff', borderColor: '#fff' }}
              onClick={() => navigate('/browse')}
            >
              Browse Items
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <SearchIcon sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h5" gutterBottom>
                  Browse Items
                </Typography>
                <Typography variant="body1">
                  Search through lost and found items across the campus.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <PostAddIcon sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h5" gutterBottom>
                  Post Items
                </Typography>
                <Typography variant="body1">
                  Report lost or found items quickly and easily.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <VerifiedUserIcon sx={{ fontSize: 60, color: '#1976d2' }} />
                <Typography variant="h5" gutterBottom>
                  Secure Claims
                </Typography>
                <Typography variant="body1">
                  Verified claim system ensures items go to the right owners.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;