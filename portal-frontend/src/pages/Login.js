import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      const token = response.data.token;
      const userData = { studentId: formData.studentId, role: 'student' };
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid Student ID or Password');
    }
  };

  const handleAdminLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await authService.adminLogin({ username: formData.studentId, password: formData.password });
    const token = response.data.token;
    const userData = { studentId: 'ADMIN', role: 'admin' };
    login(userData, token);
    navigate('/admin');
  } catch (err) {
    setError('Invalid Admin Credentials');
  }
};

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
        
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Student Login" />
          <Tab label="Admin Login" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={tabValue === 0 ? handleStudentLogin : handleAdminLogin} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Student ID / Username"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            margin="normal"
            required
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
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;