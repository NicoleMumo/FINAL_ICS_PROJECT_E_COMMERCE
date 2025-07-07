import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Link,
  Paper
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CONSUMER', // default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Send role as part of formData
      const response = await axios.post('/api/auth/register', formData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#F9FBE7',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Grid
        container
        spacing={4}
        alignItems="center"
        justifyContent="center"
        sx={{ flexGrow: 1, p: 2 }}
      >
        {/* Left Section - Branding */}
        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              maxWidth: { xs: '100%', md: '80%' },
              mx: 'auto',
            }}
          >
            <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}
            >
              FarmDirect
            </Typography>
            <Typography variant="h6" sx={{ color: '#212121' }}>
              Create your account
            </Typography>
          </Box>
        </Grid>

        {/* Right Section - Registration Form */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: 4,
              borderRadius: 2,
              boxShadow: 3,
              maxWidth: 450,
              mx: 'auto',
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: 3, color: '#4CAF50', fontWeight: 'bold' }}
            >
              Register
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E0E0E0' },
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E0E0E0' },
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                }}
              />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                  onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#E0E0E0' },
                      '&:hover fieldset': { borderColor: '#4CAF50' },
                      '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#E0E0E0' },
                      '&:hover fieldset': { borderColor: '#4CAF50' },
                      '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                  }}
                />
              <TextField
                margin="normal"
                required
                    fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E0E0E0' },
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                }}
              />
              <TextField
                select
                margin="normal"
                required
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                SelectProps={{ native: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E0E0E0' },
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                }}
              >
                <option value="CONSUMER">Consumer</option>
                <option value="FARMER">Farmer</option>
                <option value="ADMIN">Admin</option>
              </TextField>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                disabled={loading}
                    sx={{
                  mt: 3,
                  mb: 2,
                      bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#388E3C' },
                  '&.Mui-disabled': { bgcolor: '#A5D6A7' },
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Register'}
                  </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: '#0288D1' }}
              >
                Already have an account? Login
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register; 