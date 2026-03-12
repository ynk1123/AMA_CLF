import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a2e' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Campus Lost and Found Portal
        </Typography>
        <Box>
          {!user ? (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/dashboard')}
                    startIcon={<DashboardIcon />}
                  >
                    Student View
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/admin')}
                  >
                    Admin Panel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/dashboard')}
                    startIcon={<DashboardIcon />}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/chat')}
                    startIcon={<ForumIcon />}
                  >
                    Messages
                  </Button>
                </>
              )}
              {user.role === 'admin' && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/chat')}
                  startIcon={<ForumIcon />}
                >
                  Messages
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;