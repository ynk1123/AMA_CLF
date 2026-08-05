import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const Login = () => {
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [forgotDialog, setForgotDialog] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();
  const { login } = useAuth();

  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
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
      // Ensure the button never stays stuck on "Signing in...".
      // Check for suspended account (403) vs invalid credentials (401)
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Your account has been suspended');
      } else {
        setError('Invalid Student ID/Email or Password');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.adminLogin({ username: formData.studentId, password: formData.password });
      login({ studentId: 'ADMIN', role: 'admin', displayName: 'Admin' }, response.data.token);
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
    <Container maxWidth="sm" sx={{ mt: { xs: 6, sm: 10 }, mb: { xs: 6, sm: 10 } }}>

      <Paper 
        className="fade-in-scale"
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 5 },

          border: '2px solid #DC2626',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Corner decoration (Dark Mode: hide harsh triangle) */}
        <Box
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            right: 0,
            width: 80,
            height: 80,
            display: theme.palette.mode === 'dark' ? 'none' : 'block',
            background: 'linear-gradient(135deg, transparent 50%, #FEE2E2 50%)',
          })}
        />

        <Typography 
          variant="h3" 
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: '1.55rem', sm: undefined },
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
            type={showPassword ? 'text' : 'password'}
            value={formData.password} 
            onChange={handleChange} 
            margin="normal" 
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button 
            type="submit" 
            fullWidth 
            variant="contained"
            className="btn-pulse"
            disabled={loginLoading}
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
            {loginLoading ? 'Signing in...' : t('signIn')}
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

      <Dialog
        open={forgotDialog}
        onClose={() => setForgotDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>{t('resetPassword')}</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>{t('enterStudentIdOrEmail')}</Typography>

          <TextField
            fullWidth
            label={t('studentIdOrEmail')}
            value={forgotInput}
            onChange={(e) => setForgotInput(e.target.value)}
            margin="normal"
            InputLabelProps={{ sx: { color: 'text.secondary' } }}
            sx={{
              '& .MuiInputBase-input': { color: 'text.primary' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
            }}
          />

          {forgotMessage && <Alert severity="info" sx={{ mt: 2 }}>{forgotMessage}</Alert>}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setForgotDialog(false)}>{t('cancel')}</Button>

          <Button
            onClick={handleForgotPassword}
            variant="contained"
            disabled={forgotLoading || !forgotInput}
            sx={{
              backgroundColor: '#DC2626',
              color: 'text.primary',
              '&.Mui-disabled': {
                backgroundColor: (theme) => theme.palette.action.disabledBackground,
                color: (theme) => theme.palette.action.disabled,
              },
            }}
          >
            {forgotLoading ? t('sending') : t('sendResetLink')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
