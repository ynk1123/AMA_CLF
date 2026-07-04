import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const Login = () => {
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [forgotDialog, setForgotDialog] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      login({ 
        studentId: response.data.user.studentId, 
        displayName: response.data.user.displayName,
        email: response.data.user.email,
        role: 'student' 
      }, response.data.token);
      navigate('/dashboard');
    } catch (err) { 
      // Check for suspended account (403) vs invalid credentials (401)
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Your account has been suspended');
      } else {
        setError('Invalid Student ID/Email or Password');
      }
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.adminLogin({ username: formData.studentId, password: formData.password });
      login({ studentId: 'ADMIN', role: 'admin' }, response.data.token);
      navigate('/admin');
    } catch (err) { setError('Invalid Admin Credentials'); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const value = forgotInput.trim();
      const isEmail = value.includes('@');
      const payload = isEmail ? { email: value } : { studentId: value };
      const response = await authService.forgotPassword(payload);
      // Never display reset token/link in the UI (even if backend accidentally returns it).
      setForgotMessage(response.data.message || 'If the account exists, a reset email will be sent shortly.');
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'Failed');
    }
    setForgotLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 10 }}>
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
          {t('welcomeBack')}
        </Typography>
        <Typography 
          variant="body1" 
          align="center" 
          sx={{ color: '#4B5563', mb: 3 }}
        >
          {t('signInToContinue')}
        </Typography>

        <Tabs 
          value={tabValue} 
          onChange={(e, v) => { setTabValue(v); setError(''); }} 
          centered
          sx={{ mb: 3, '& .MuiTabs-indicator': { backgroundColor: '#DC2626' } }}
        >
          <Tab label={t('student')} sx={{ color: '#4B5563' }} />
          <Tab label={t('admin')} sx={{ color: '#4B5563' }} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={tabValue === 0 ? handleStudentLogin : handleAdminLogin}>
          <TextField 
            fullWidth label={t('studentIdOrEmail')} 
            name="studentId" 
            value={formData.studentId} 
            onChange={handleChange} 
            margin="normal" 
            required 
            sx={{ mb: 2 }}
          />
          <TextField 
            fullWidth label={t('password')} 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            margin="normal" 
            required
            sx={{ mb: 2 }}
          />
          <Button 
            type="submit" 
            fullWidth 
            variant="contained"
            className="btn-pulse"
            sx={{ 
              mt: 2,
              mb: 2,
              backgroundColor: '#DC2626',
              fontWeight: 700,
              py: 1.5,
              fontSize: '1.1rem',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
              '&:hover': { 
                backgroundColor: '#B91C1C',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5)',
              }
            }}
          >
            {t('signIn')}
          </Button>
          <Button 
            fullWidth 
            variant="text" 
            startIcon={<MailOutlineIcon />} 
            onClick={() => setForgotDialog(true)} 
            sx={{ color: '#DC2626', fontWeight: 600 }}
          >
            {t('forgotPassword')}
          </Button>
        </Box>
      </Paper>

      <Dialog open={forgotDialog} onClose={() => setForgotDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>{t('resetPassword')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#4B5563' }}>{t('enterStudentIdOrEmail')}</Typography>
          <TextField fullWidth label={t('studentIdOrEmail')} value={forgotInput} onChange={(e) => setForgotInput(e.target.value)} margin="normal" />
          {forgotMessage && <Alert severity="info" sx={{ mt: 2 }}>{forgotMessage}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotDialog(false)}>{t('cancel')}</Button>
          <Button onClick={handleForgotPassword} variant="contained" disabled={forgotLoading || !forgotInput} sx={{ backgroundColor: '#DC2626' }}>
            {forgotLoading ? t('sending') : t('sendResetLink')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
