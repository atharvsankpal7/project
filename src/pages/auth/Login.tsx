import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Card, TextField, Button, Typography, Container, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { setUser } from '../../store/slices/authSlice';
import { KeyRound } from 'lucide-react';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { db } = useIndexedDB();
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Check if user exists
      const userIndex = db.transaction('users').store.index('by-email');
      const existingUser = await userIndex.get(email);

      let user;
      if (existingUser) {
        // Verify role matches
        if (existingUser.role !== role) {
          toast.error('Invalid role for this email');
          return;
        }
        user = existingUser;
      } else {
        // Create new user
        user = {
          id: crypto.randomUUID(),
          email,
          role: role as 'issuer' | 'candidate' | 'organization',
          name: email.split('@')[0],
        };
        await db.add('users', user);
      }

      // Update Redux store and localStorage
      dispatch(setUser(user));
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on role
      const paths = {
        issuer: '/issuer',
        candidate: '/candidate',
        organization: '/organization',
      };
      navigate(paths[role as keyof typeof paths]);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ p: 4, width: '100%', maxWidth: 'sm' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <KeyRound size={40} className="text-primary mb-2" />
            <Typography component="h1" variant="h5">
              Certificate Verification System
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <MenuItem value="issuer">Issuer</MenuItem>
                <MenuItem value="candidate">Candidate</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;