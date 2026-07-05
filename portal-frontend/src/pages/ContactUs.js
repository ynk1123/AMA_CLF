import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useLanguage } from '../context/LanguageContext';
import { contactService } from '../services/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [honeypot, setHoneypot] = useState(''); // Hidden field for bots
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Don't update honeypot field - it's hidden from users
    if (name !== 'website') {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.name || !formData.email || !formData.message) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Additional honeypot check (redundant but extra security)
      if (honeypot) {
        // Pretend to accept to fool the bot
        setSuccess(true);
        setLoading(false);
        return;
      }

      const response = await contactService.submitContact({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        website: honeypot // Send empty honeypot (or filled if bot filled it)
      });

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;
      setError(
        status && backendMessage
          ? `Request failed (${status}): ${backendMessage}`
          : backendMessage || 'Failed to send message. Please try again.'
      );
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper 
        className="fade-in-scale"
        elevation={0}
        sx={{ 
          p: 5,
          border: '2px solid #DC2626',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Corner decoration */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, transparent 50%, #FEE2E2 50%)',
        }} />

        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: '#DC2626',
            mb: 1,
          }}
        >
          {t('contactUs') || 'Contact Us'}
        </Typography>
        <Typography 
          variant="body1" 
          align="center" 
          sx={{ color: '#4B5563', mb: 4 }}
        >
          {t('contactUsSubtitle') || 'Have a question or feedback? We\'d love to hear from you!'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, backgroundColor: '#DCFCE7', color: '#16A34A' }}>
            {t('messageSent') || 'Thank you! Your message has been sent successfully.'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField 
              fullWidth 
              label={t('name') || 'Your Name'} 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              margin="normal" 
              required
              placeholder={t('enterYourName') || 'Enter your name'}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#DC2626' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#DC2626' }
              }}
            />
            
            <TextField 
              fullWidth 
              label={t('email') || 'Email Address'} 
              name="email"
              type="email"
              value={formData.email} 
              onChange={handleChange} 
              margin="normal" 
              required
              placeholder={t('enterYourEmail') || 'Enter your email'}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#DC2626' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#DC2626' }
              }}
            />
            
            <TextField 
              fullWidth 
              label={t('subject') || 'Subject (Optional)'} 
              name="subject"
              value={formData.subject} 
              onChange={handleChange} 
              margin="normal"
              placeholder={t('whatIsItAbout') || 'What is this about?'}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#DC2626' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#DC2626' }
              }}
            />
            
            <TextField 
              fullWidth 
              label={t('message')} 
              name="message"
              value={formData.message} 
              onChange={handleChange} 
              margin="normal" 
              required
              multiline
              rows={6}
              placeholder={t('yourMessage') || 'Type your message here...'}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#DC2626' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#DC2626' }
              }}
            />

            {/* HONEYPOT FIELD - Hidden from real users but visible to bots */}
            <TextField
              fullWidth
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              margin="normal"
              sx={{
                position: 'absolute',
                left: '-9999px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                opacity: 0
              }}
              // Bot detection field - leave this blank (if filled, it's a bot)
              placeholder="Leave this empty"
              autoComplete="off"
              tabIndex={-1}
              autoFocus={false}
            />

            <Button 
              type="submit" 
              fullWidth 
              variant="contained"
              className="btn-pulse"
              disabled={loading}
              startIcon={<SendIcon />}
              sx={{ 
                mt: 2,
                backgroundColor: '#DC2626',
                fontWeight: 700,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                '&:hover': { 
                  backgroundColor: '#B91C1C',
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5)',
                },
                '&:disabled': {
                  backgroundColor: '#FCA5A5'
                }
              }}
            >
              {loading ? (t('sending') || 'Sending...') : (t('sendMessage') || 'Send Message')}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactUs;
