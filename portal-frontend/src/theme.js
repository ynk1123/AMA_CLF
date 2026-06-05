import { createTheme } from '@mui/material/styles';

// Red Theme - Bold, energetic with animations
const theme = createTheme({
  palette: {
    primary: {
      main: '#DC2626', // Bold Red
      light: '#EF4444',
      dark: '#B91C1C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1A1A2E', // Dark navy for contrast
      light: '#2D2D44',
      dark: '#0F0F1A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#4B5563',
    },
    error: {
      main: '#DC2626',
    },
    success: {
      main: '#059669',
    },
    warning: {
      main: '#D97706',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '10px 20px' },
        containedPrimary: { '&:hover': { backgroundColor: '#EF4444' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, transition: 'all 0.3s ease' },
      },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } } },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#DC2626', color: '#ffffff' },
      },
    },
  },
});

// CSS Animations keyframes
const GlobalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .fade-in { animation: fadeIn 0.6s ease forwards; }
  .slide-in { animation: slideIn 0.5s ease forwards; }
  .pulse { animation: pulse 2s ease infinite; }
  .float { animation: float 3s ease infinite; }
  .fade-in-up { animation: fadeInUp 0.8s ease forwards; }
  
  .card-hover {
    transition: all 0.3s ease;
  }
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(220, 38, 38, 0.2);
  }
`;

export default theme;
export { GlobalStyles };
