import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    displayName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await authService.register(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Display Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            placeholder="yourname@gmail.com"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;