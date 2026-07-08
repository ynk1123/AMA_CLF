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
          py: { xs: 7, sm: 10, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
{/* Decorative circles - More circles with more movement */}
        <Box className="float-more" sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
        }} />
        <Box className="float-wide" sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <Box className="float-more" sx={{
          position: 'absolute',
          top: '15%',
          left: '3%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          animationDelay: '1s',
        }} />
        <Box className="float-wide" sx={{
          position: 'absolute',
          bottom: '25%',
          right: '2%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.09)',
          animationDelay: '2s',
        }} />
        <Box className="float-more" sx={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          animationDelay: '0.5s',
        }} />
        <Box className="float-wide" sx={{
          position: 'absolute',
          bottom: '50%',
          left: '15%',
          width: 45,
          height: 45,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.11)',
          animationDelay: '1.5s',
        }} />
        <Box className="float-more" sx={{
          position: 'absolute',
          top: '60%',
          right: '20%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          animationDelay: '2.5s',
        }} />
        <Box className="float-wide" sx={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          animationDelay: '3s',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box className="fade-in-scale" sx={{ px: { xs: 2, md: 0 } }}>
              <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: '28px !important', sm: '1.45rem', md: '3rem' },
                lineHeight: { xs: 1.1, sm: 1.2, md: 1.15 },
                mb: { xs: '8px !important', sm: undefined },
                // Desktop: make the main title much more prominent (keep mobile as-is).
                '@media (min-width: 769px)': {
                  fontSize: '42px !important',
                },
              }}
            >



              {t('welcomeTitle')}
            </Typography>
          </Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ opacity: 0.95, mb: 4, fontSize: { xs: '1rem', md: undefined } }}
            className="fade-in stagger-1"
          >
            {t('welcomeSubtitle')}
          </Typography>
          <Box
            sx={{
              mt: 5,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 1.5, sm: 0 },
              '@media (max-width:600px)': {
                px: '16px',
                width: '100%',
              },
            }}
            className="fade-in stagger-2"
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                width: { xs: '100%', sm: 'auto' },
                mr: { xs: 0, sm: 2 },
                backgroundColor: '#fff',
                color: '#DC2626',
                fontWeight: 700,
                px: { xs: 3, md: 4 },
                py: 1.3,
                '&:hover': {
                  backgroundColor: '#1A1A2E',
                  color: '#fff',
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => navigate('/register')}
            >
              {t('getStarted')}
            </Button>
            <Button
              variant="contained"
              size="large"
              sx={{
                width: { xs: '100%', sm: 'auto' },
                mr: { xs: 0, sm: 2 },
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 600,
                px: { xs: 3, md: 4 },
                py: 1.3,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
              }}
              onClick={() => navigate('/browse')}
            >
              {t('browseItems')}
            </Button>
          </Box>

        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: { xs: 4, sm: 7, md: 10 } }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            mb: { xs: 2, sm: 4, md: 5 },
            fontWeight: 700,
            color: '#DC2626',
            lineHeight: 1.1,
            textAlign: { xs: 'center', sm: 'center', md: 'center' },
          }}
        >
          {t('features')}
        </Typography>
        <Grid container spacing={{ xs: 0.5, sm: 3, md: 4 }}>
          <Grid item xs={12} md={4}>
            <Card
              className="card-hover fade-in stagger-1"
              sx={{
                height: '100%',
                p: { xs: 1.25, sm: 2, md: 3 },
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  display: { xs: 'flex', md: 'block' },
                  flexDirection: { xs: 'row', md: 'block' },
                  textAlign: { xs: 'left', md: 'center' },
                  alignItems: { xs: 'center', md: 'center' },
                  justifyContent: 'center',
                  gap: { xs: 1.25, md: 0 },
                  height: '100%',
                }}
              >
                <Box
                  className="float"
                  sx={{
                    mb: { xs: 0, md: 2 },
                    mr: { xs: 0.5, md: 0 },
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'center' },
                    alignItems: { xs: 'center', md: 'center' },
                    py: { xs: 2, md: 0 },
                  }}
                >
                  <SearchIcon
                    sx={{
                      fontSize: { xs: 30, sm: 34, md: 55 },
                      color: '#DC2626',
                      mt: { xs: '3px', md: 0 },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#DC2626',
                      mb: { xs: 0.25, md: undefined },
                      fontSize: { xs: '1.0rem', sm: '1.1rem', md: undefined },
                      lineHeight: 1.2,
                    }}
                  >
                    {t('feature1Title')}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: undefined },
                      lineHeight: 1.3,
                    }}
                  >
                    {t('feature1Desc')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              className="card-hover fade-in stagger-2"
              sx={{
                height: '100%',
                p: { xs: 1.25, sm: 2, md: 3 },
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  display: { xs: 'flex', md: 'block' },
                  flexDirection: { xs: 'row', md: 'block' },
                  textAlign: { xs: 'left', md: 'center' },
                  alignItems: { xs: 'center', md: 'center' },
                  justifyContent: 'center',
                  gap: { xs: 1.25, md: 0 },
                  height: '100%',
                }}
              >
                <Box
                  className="float"
                  style={{ animationDelay: '0.5s' }}
                  sx={{
                    mb: { xs: 0, md: 2 },
                    mr: { xs: 0.5, md: 0 },
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', md: 'center' },
                    alignItems: { xs: 'center', md: 'center' },
                    pt: { xs: 0, md: 0 },
                  }}
                >
                  <PostAddIcon
                    sx={{
                      fontSize: { xs: 30, sm: 34, md: 55 },
                      color: '#DC2626',
                      mt: { xs: '3px', md: 0 },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#DC2626',
                      mb: { xs: 0.25, md: undefined },
                      fontSize: { xs: '1.0rem', sm: '1.1rem', md: undefined },
                      lineHeight: 1.2,
                    }}
                  >
                    {t('feature2Title')}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: undefined },
                      lineHeight: 1.3,
                    }}
                  >
                    {t('feature2Desc')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              className="card-hover fade-in stagger-3"
              sx={{
                height: '100%',
                p: { xs: 1.25, sm: 2, md: 3 },
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  display: { xs: 'flex', md: 'block' },
                  flexDirection: { xs: 'row', md: 'block' },
                  textAlign: { xs: 'left', md: 'center' },
                  alignItems: { xs: 'center', md: 'center' },
                  justifyContent: { xs: 'center', md: 'center' },
                  gap: { xs: 1.25, md: 0 },
                  height: '100%',
                }}
              >
                <Box
                  className="float"
                  style={{ animationDelay: '1s' }}
                  sx={{
                    mb: { xs: 0, md: 2 },
                    mr: { xs: 0.5, md: 0 },
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', md: 'center' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                  }}
                >
                  <VerifiedUserIcon
                    sx={{
                      fontSize: { xs: 30, sm: 34, md: 55 },
                      color: '#DC2626',
                      mt: { xs: '3px', md: 0 },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#DC2626',
                      mb: { xs: 0.25, md: undefined },
                      fontSize: { xs: '1.0rem', sm: '1.1rem', md: undefined },
                      lineHeight: 1.2,
                    }}
                  >
                    {t('feature3Title')}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: undefined },
                      lineHeight: 1.3,
                    }}
                  >
                    {t('feature3Desc')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;
