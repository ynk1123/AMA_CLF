import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useLanguage } from '../context/LanguageContext';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box>
      {/* Hero Section - Red Theme */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          animation: 'float 4s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          animation: 'float 5s ease-in-out infinite',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box className="fade-in-scale">
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
              {t('welcomeTitle')}
            </Typography>
          </Box>
          <Typography variant="h5" gutterBottom sx={{ opacity: 0.95, mb: 4 }} className="fade-in stagger-1">
            {t('welcomeSubtitle')}
          </Typography>
          <Box sx={{ mt: 5 }} className="fade-in stagger-2">
            <Button
              variant="contained"
              size="large"
              sx={{ 
                mr: 2, 
                backgroundColor: '#fff', 
                color: '#DC2626',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': { 
                  backgroundColor: '#1A1A2E',
                  color: '#fff',
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => navigate('/register')}
            >
              {t('getStarted')}
            </Button>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                mr: 2, 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: '#fff',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
              onClick={() => navigate('/browse')}
            >
              {t('browseItems')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 10 }}>
        <Typography variant="h4" align="center" sx={{ mb: 5, fontWeight: 700, color: '#DC2626' }}>
          {t('features')}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card className="card-hover fade-in stagger-1" sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <CardContent>
                <Box className="float" sx={{ mb: 2 }}>
                  <SearchIcon sx={{ fontSize: 55, color: '#DC2626' }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#DC2626' }}>
                  {t('feature1Title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('feature1Desc')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="card-hover fade-in stagger-2" sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <CardContent>
                <Box className="float" style={{ animationDelay: '0.5s' }} sx={{ mb: 2 }}>
                  <PostAddIcon sx={{ fontSize: 55, color: '#DC2626' }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#DC2626' }}>
                  {t('feature2Title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('feature2Desc')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="card-hover fade-in stagger-3" sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <CardContent>
                <Box className="float" style={{ animationDelay: '1s' }} sx={{ mb: 2 }}>
                  <VerifiedUserIcon sx={{ fontSize: 55, color: '#DC2626' }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#DC2626' }}>
                  {t('feature3Title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('feature3Desc')}
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
