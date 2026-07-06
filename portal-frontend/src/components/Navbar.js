import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';

import ForumIcon from '@mui/icons-material/Forum';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [langAnchor, setLangAnchor] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLanguageClick = (event) => {
    setLangAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangAnchor(null);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };


  const handleLanguageSelect = (code) => {
    changeLanguage(code);
    handleLanguageClose();
  };

  const getCurrentLanguage = () => {
    return languages.find(l => l.code === language) || languages[0];
  };

  return (
    <AppBar position="static" className="fade-in">
      <Toolbar sx={{ minHeight: { xs: 60, sm: 64 } }}>
        <SearchIcon sx={{ mr: 1, fontSize: { xs: 20, sm: 28 }, display: { xs: 'none', sm: 'inline-flex' } }} />

        {/* Brand (left) */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: { xs: '0.95rem', sm: '1rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onClick={() => navigate(user ? '/dashboard' : '/')}
        >
          {t('campusLostAndFound')}
        </Typography>

        {/* Language selector (kept visible, but compact) */}
        <Button
          color="inherit"
          onClick={handleLanguageClick}
          startIcon={<LanguageIcon />}

          sx={{
            mr: 1.5,
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.3)',
            px: { xs: 0.75, sm: 1 },
            minWidth: { xs: 0, sm: 'auto' },
            '& .MuiButton-startIcon': { mr: { xs: 0.5, sm: 0.75 } },
            '& .MuiButton-endIcon': { display: { xs: 'none', sm: 'inline-flex' } },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
          }}
        >
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24 }}>
            <LanguageIcon sx={{ fontSize: 22, color: 'white' }} />
          </Box>


        </Button>
        <Menu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          onClose={handleLanguageClose}
          PaperProps={{ sx: { mt: 1 } }}
        >
          {languages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              selected={language === lang.code}
              sx={{
                fontWeight: language === lang.code ? 700 : 400,
                backgroundColor: language === lang.code ? '#FEE2E2' : 'transparent',
              }}
            >
              <Typography sx={{ mr: 1 }}>{lang.flag}</Typography>
              {lang.name}
            </MenuItem>
          ))}
        </Menu>


        {/* Mobile menu icon */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <IconButton
            size="small"
            color="inherit"
            onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
            sx={{ minWidth: 36, borderRadius: 2 }}
            aria-label="open mobile menu"
          >
            ☰
          </IconButton>
        </Box>

        {/* Mobile nav drawer/menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          PaperProps={{
            sx: { mt: 1, minWidth: 180 },
          }}
        >
          {user ? (
            user.role === 'admin' ? (
              <MenuItem
                onClick={() => {
                  navigate('/dashboard');
                  handleMobileMenuClose();
                }}
              >
                {t('view')}
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  navigate('/dashboard');
                  handleMobileMenuClose();
                }}
              >
                {t('dashboard')}
              </MenuItem>
            )
          ) : (
            <MenuItem
              onClick={() => {
                navigate('/login');
                handleMobileMenuClose();
              }}
            >
              {t('login')}
            </MenuItem>
          )}

          {user && user.role === 'admin' && (
            <MenuItem
              onClick={() => {
                navigate('/admin');
                handleMobileMenuClose();
              }}
            >
              {t('admin')}
            </MenuItem>
          )}

          {user && (
            <MenuItem
              onClick={() => {
                navigate('/chat');
                handleMobileMenuClose();
              }}
            >
              {t('messages')}
            </MenuItem>
          )}

          {user ? (
            <MenuItem
              onClick={() => {
                handleLogout();
                handleMobileMenuClose();
              }}
            >
              {t('logout')}
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                navigate('/register');
                handleMobileMenuClose();
              }}
            >
              {t('register')}
            </MenuItem>
          )}
        </Menu>

        {/* Desktop nav (hidden on mobile) */}

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          {!user ? (


            <>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  fontWeight: 600,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
                }}
              >
                {t('login')}
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/register')}
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: '#fff',
                  color: '#DC2626',
                  px: 2,
                  ml: 1,
                  '&:hover': { backgroundColor: '#1A1A2E', color: '#fff' }
                }}
              >
                {t('register')}
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
                    sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    {t('view')}
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/admin')}
                    sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    {t('admin')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/dashboard')}
                    startIcon={<DashboardIcon />}
                    sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    {t('dashboard')}
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/chat')}
                    startIcon={<ForumIcon />}
                    sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    {t('messages')}
                  </Button>
                </>
              )}
              {user.role === 'admin' && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/chat')}
                  startIcon={<ForumIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
                >
                  {t('messages')}
                </Button>
              )}
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  fontWeight: 600,
                  ml: 1,
                  border: '2px solid rgba(255,255,255,0.5)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
                }}
              >
                {t('logout')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
