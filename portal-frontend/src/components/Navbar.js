import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material';
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

  const handleLanguageSelect = (code) => {
    changeLanguage(code);
    handleLanguageClose();
  };

  const getCurrentLanguage = () => {
    return languages.find(l => l.code === language) || languages[0];
  };

  return (
    <AppBar position="static" className="fade-in">
      <Toolbar>
        <SearchIcon sx={{ mr: 1, fontSize: { xs: 20, sm: 28 }, display: { xs: 'none', sm: 'inline-flex' } }} />

        <Typography 
          variant="h6" 
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: { xs: '0.95rem', sm: '1rem' },
          }}
          onClick={() => navigate(user ? '/dashboard' : '/')}
        >

          {t('campusLostAndFound')}
        </Typography>
        
        {/* Language Selector */}
        <Button
          color="inherit"
          onClick={handleLanguageClick}
          startIcon={<LanguageIcon />}
          sx={{ 
            mr: 2,
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.3)',
            px: { xs: 0.75, sm: 1 },
            minWidth: { xs: 0, sm: 'auto' },
            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 } },
            '& .MuiButton-endIcon': { display: { xs: 'none', sm: 'inline-flex' } },

            '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
          }}
        >
          {getCurrentLanguage().flag} {getCurrentLanguage().code.toUpperCase()}
        </Button>
        <Menu
          anchorEl={langAnchor}
          open={Boolean(langAnchor)}
          onClose={handleLanguageClose}
          PaperProps={{
            sx: { mt: 1 }
          }}
        >
          {languages.map((lang) => (
            <MenuItem 
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              selected={language === lang.code}
              sx={{ 
                fontWeight: language === lang.code ? 700 : 400,
                backgroundColor: language === lang.code ? '#FEE2E2' : 'transparent'
              }}
            >
              <Typography sx={{ mr: 1 }}>{lang.flag}</Typography>
              {lang.name}
            </MenuItem>
          ))}
        </Menu>

<Box>
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
