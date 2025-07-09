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

const unitOptions = [
    { value: "leaf", label: "Leaf (vegetables)" },
    { value: "kg", label: "Kilogram (grains)" },
    { value: "fruit", label: "Fruit (fruits)" },
    { value: "piece", label: "Piece (poultry)" },
    { value: "litre", label: "Litre (dairy)" },
  ];

const CategoryForm = ({ open, onClose, onSubmit, category }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setUnit(category.unit || '');
    } else {
      setName('');
      setUnit('');
    }
  }, [category, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !unit) return;
    onSubmit({ name, unit });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel>Unit</InputLabel>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              label="Unit"
            >
              {unitOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {category ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;
