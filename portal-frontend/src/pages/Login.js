import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

const handleStudentLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await authService.login(formData);
    // Use displayName from backend response
    login({ 
      studentId: response.data.user.studentId, 
      displayName: response.data.user.displayName,
      email: response.data.user.email,
      role: 'student' 
    }, response.data.token);
    navigate('/dashboard');
  } catch (err) { setError('Invalid Student ID/Email or Password'); }
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
const response = await authService.forgotPassword({ email: forgotInput });
      let msg = response.data.message;
      if (response.data.resetLink && !response.data.emailSent) msg += ' Link: ' + response.data.resetLink;
      setForgotMessage(msg);
    } catch (err) { setForgotMessage(err.response?.data?.message || 'Failed'); }
    setForgotLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Login</Typography>
        <Tabs value={tabValue} onChange={(e, v) => { setTabValue(v); setError(''); }} centered>
          <Tab label="Student Login" /><Tab label="Admin Login" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={tabValue === 0 ? handleStudentLogin : handleAdminLogin} sx={{ mt: 3 }}>
          <TextField fullWidth label="Student ID or Email Address" name="studentId" value={formData.studentId} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} margin="normal" required />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }}>Login</Button>
          <Button fullWidth variant="text" startIcon={<MailOutlineIcon />} onClick={() => setForgotDialog(true)} sx={{ color: 'primary.main' }}>Forgot Password?</Button>
        </Box>
      </Paper>
      <Dialog open={forgotDialog} onClose={() => setForgotDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Enter your Student ID or Email.</Typography>
          <TextField fullWidth label="Student ID or Email" value={forgotInput} onChange={(e) => setForgotInput(e.target.value)} margin="normal" />
          {forgotMessage && <Alert severity={forgotMessage.includes('✅') ? 'success' : 'info'} sx={{ mt: 2 }}>{forgotMessage}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotDialog(false)}>Cancel</Button>
          <Button onClick={handleForgotPassword} variant="contained" disabled={forgotLoading || !forgotInput}>{forgotLoading ? 'Sending...' : 'Send Reset Link'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;