import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const UserForm = ({ open, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONSUMER',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Password should not be pre-filled
        role: user.role || 'CONSUMER',
        phone: user.phone || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'CONSUMER',
        phone: '',
      });
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label={user ? 'New Password (optional)' : 'Password'}
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            required={!user} // Password is required for new users
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="CONSUMER">Consumer</MenuItem>
              <MenuItem value="FARMER">Farmer</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {user ? 'Save Changes' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
