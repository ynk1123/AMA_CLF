import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, InputAdornment, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => event.preventDefault();
  const handleMouseDownConfirmPassword = (event) => event.preventDefault();

  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(formData);
      setSuccess('Registration successful! Check your email to verify your account, then log in.');
      // Do not auto-redirect before email verification
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }

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
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, #FEE2E2 50%, transparent 50%)',
        }} />

        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 700, color: '#DC2626', mb: 1 }}
        >
          Create Account
        </Typography>
        <Typography 
          variant="body1" 
          align="center" 
          sx={{ color: '#4B5563', mb: 3 }}
        >
          Join the campus community
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, backgroundColor: '#D1FAE5', color: '#059669' }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ inputMode: 'numeric', pattern: '\\d{11}', maxLength: 11 }}
            sx={{ mb: 2 }}
            disabled={isSubmitting}
          />

          <TextField
            fullWidth label="Display Name" name="displayName" value={formData.displayName}
            onChange={handleChange} margin="normal" required sx={{ mb: 2 }}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth label="Email" name="email" type="email" value={formData.email}
            onChange={handleChange} margin="normal" required sx={{ mb: 2 }}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
            onChange={handleChange} margin="normal" required sx={{ mb: 2 }}
            disabled={isSubmitting}
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

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ mb: 2 }}
            disabled={isSubmitting}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownConfirmPassword}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            disabled={isSubmitting}
            sx={{ 
              mt: 1,
              backgroundColor: '#DC2626',
              fontWeight: 700,
              py: 1.5,
              fontSize: '1.1rem',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
              '&:hover': { backgroundColor: '#B91C1C' }
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>

        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3, color: '#4B5563' }}>
          Already have an account?{' '}
          <Typography
            component="span"
            sx={{ 
              color: '#DC2626', 
              fontWeight: 700, 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => navigate('/login')}
          >
            Login
          </Typography>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
