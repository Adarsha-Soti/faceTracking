import React, { useState } from 'react';
import { 
  ThemeProvider,
  createTheme,
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CssBaseline,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    background: {
      paper: '#ffffff',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  shape: {
    borderRadius: 8,
  },
});
const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const AuthBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  },
  width: '100%',
  maxWidth: '450px',
  minWidth:'320px'
}));

const Authenticated = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dummyCredentials = {
    email: "aadarsha@gmail.com",
    password: "FaceApp@123"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (formData.email === dummyCredentials.email && 
        formData.password === dummyCredentials.password) {
      setError('');
      console.log('Login successful!');
      navigate('/Dashboard');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handleChange = (prop) => (event) => {
    setFormData({ ...formData, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthContainer component="main" maxWidth="100vw">
        <CssBaseline />
        <AuthBox>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Employee Tracking 
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Please sign in to continue
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Email Address"
            value={formData.email}
            onChange={handleChange('email')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Password"
            type={formData.showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-1px)'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{' '}
            <Button 
              color="primary" 
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Sign up
            </Button>
          </Typography>
        </Box>
      </AuthBox>
    </AuthContainer>
    </ThemeProvider>
  );
};

export default Authenticated;