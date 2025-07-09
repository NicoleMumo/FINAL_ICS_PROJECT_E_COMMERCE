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
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableSortLabel,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import AdminLayout from "../../layouts/AdminLayout";
import UserForm from "./UserForm";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        role: filters.role,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      const { data } = await axios.get("/api/admin/users", { params });
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search input
    return () => clearTimeout(timer);
  }, [filters, sortConfig]);

    const handleOpenForm = (user = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedUser(null);
    setIsFormOpen(false);
  };

    const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await axios.put(`/api/admin/users/${selectedUser.id}`, formData);
      } else {
        await axios.post("/api/admin/users", formData);
      }
      await fetchUsers();
      handleCloseForm();
    } catch (err) {
      console.error("Error submitting user form:", err);
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "FARMER":
        return "success";
      case "CONSUMER":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <AdminLayout>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          User Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add User
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          name="search"
          label="Search by Name/Email"
          variant="outlined"
          value={filters.search}
          onChange={handleFilterChange}
          fullWidth
        />
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            label="Role"
          >
            <MenuItem value=""><em>All Roles</em></MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="FARMER">Farmer</MenuItem>
            <MenuItem value="CONSUMER">Consumer</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" m={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : users.length === 0 ? (
        <Alert severity="info">No users found</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
                        <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {['id', 'name', 'email', 'role', 'createdAt'].map((headCell) => (
                  <TableCell key={headCell}>
                    <TableSortLabel
                      active={sortConfig.key === headCell}
                      direction={sortConfig.key === headCell ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort(headCell)}
                    >
                      {headCell.charAt(0).toUpperCase() + headCell.slice(1)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                >
                                    <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                                    <TableCell>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(user)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <UserForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        user={selectedUser}
      />
    </AdminLayout>
  );
};

export default UserList;
