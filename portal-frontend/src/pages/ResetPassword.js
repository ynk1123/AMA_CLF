import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Alert, Box, CircularProgress } from '@mui/material';
import { authService } from '../services/api';

function ResetPassword() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  // Get token from URL
  useEffect(() => {
    if (params.token) {
      setToken(params.token);
    }
  }, [params]);

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Backend expects POST /api/auth/resetPassword/:id/:token
      const response = await authService.resetPassword({
        id: params.id,
        token: token,
        password: newPassword
      });
      setMessage('✅ Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          🔐 Reset Password
        </Typography>
        
        {message ? (
          <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>
        ) : (
          <Box component="form" onSubmit={handleReset} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading || !token}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ResetPassword;