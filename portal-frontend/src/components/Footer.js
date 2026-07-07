import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1A1A2E',
        color: 'white',
        py: 3,
        mt: 'auto',
        textAlign: 'center',
        '@media (max-width:600px)': {
          pt: '20px !important',
          pb: '16px !important',
        },

      }}
    >
      <Container maxWidth="lg">
        {/* Contact - Centered */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {t('contactUs')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
            {t('contactFooterSubtitle')}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/contact')}
            sx={{
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { color: '#EF4444' },
            }}
          >
            <EmailIcon sx={{ fontSize: 18 }} />
            {t('sendMessage')}
          </Link>
        </Box>

        {/* Copyright */}
        <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.6,
              '@media (max-width:600px)': {
                fontSize: '11px !important',
                opacity: 0.5,
                pb: '12px',
              },
            }}
          >
            © {currentYear} Campus Lost & Found. All rights reserved.
          </Typography>

        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
