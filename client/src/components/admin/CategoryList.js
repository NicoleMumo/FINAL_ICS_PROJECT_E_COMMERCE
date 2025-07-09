import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import AdminLayout from "../../layouts/AdminLayout";
import CategoryForm from './CategoryForm';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const unitOptions = [
    { value: "leaf", label: "Leaf (vegetables)" },
    { value: "kg", label: "Kilogram (grains)" },
    { value: "fruit", label: "Fruit (fruits)" },
    { value: "piece", label: "Piece (poultry)" },
    { value: "litre", label: "Litre (dairy)" },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/categories");
      setCategories(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

    const handleOpenForm = (category = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedCategory(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`/api/admin/categories/${categoryId}`);
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

    const handleSubmit = async (formData) => {
    try {
      if (selectedCategory) {
        await axios.put(`/api/admin/categories/${selectedCategory.id}`, formData);
      } else {
        await axios.post('/api/admin/categories', formData);
      }
      fetchCategories();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  return (
    <AdminLayout>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" color="primary">
          Category Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Category
        </Button>
      </Box>

      

      {loading ? (
        <Box display="flex" justifyContent="center" m={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : categories.length === 0 ? (
        <Alert severity="info">No categories found</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "background.default" }}>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                >
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{category.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {category.unit || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                                    <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(category)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <CategoryForm 
        open={isFormOpen} 
        onClose={handleCloseForm} 
        onSubmit={handleSubmit} 
        category={selectedCategory} 
      />
    </AdminLayout>
  );
};

export default CategoryList;
