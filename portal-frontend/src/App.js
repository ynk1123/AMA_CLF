import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Chat from './pages/Chat';
import ContactUs from './pages/ContactUs';
import './styles/mobile-animations.css';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
<Router>
            <Navbar />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
<Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Password reset link from email */}
                <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* Fallback: if refresh/deep link fails, still load SPA */}
                <Route path="*" element={<Landing />} />
              </Routes>
<Footer />
            </Box>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
