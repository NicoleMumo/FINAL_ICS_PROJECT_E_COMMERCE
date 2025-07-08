// src/App.js
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios";

// Import ProtectedRoute
import ProtectedRoute from "./components/auth/ProtectedRoute";

// General Home Page
import Home from "./components/Home";

// Farmer Portal Components
import Dashboard from "./components/farmer/Dashboard";
import AddProductForm from "./components/farmer/AddProductForm";
import Products from "./components/farmer/Products";
import Inventory from "./components/farmer/Inventory";
import Orders from "./components/farmer/Orders";
import Analytics from "./components/farmer/Analytics";
import EditProductForm from "./components/farmer/EditProductForm";

// Consumer Portal Components
import ConsumerDashboard from "./components/consumer/Dashboard";

// Admin Portal Components
import AdminDashboard from './components/admin/Dashboard';
import UserList from './components/admin/UserList';
import CategoryList from './components/admin/CategoryList';
import OrderList from './components/admin/OrderList';
import ProductList from './components/admin/ProductList';

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Define your Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50", // Green
    },
    secondary: {
      main: "#FFEB3B", // Yellow
    },
    error: {
      main: "#E53935", // Red
    },
    background: {
      default: "#FAFAFA", // Light Grey
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif", // Use Inter font
  },
});

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000'; // adjust this to match your server URL

// Axios interceptor configuration
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

function App() {
  useEffect(() => {
    console.log('App component mounted. Axios interceptor should be active.');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />

          {/* Protected Farmer Routes */}
          <Route 
            path="/farmer/dashboard" 
            element={<ProtectedRoute element={<Dashboard />} requiredRole="FARMER" />} 
          />
          <Route 
            path="/farmer/add-product" 
            element={<ProtectedRoute element={<AddProductForm />} requiredRole="FARMER" />} 
          />
          <Route 
            path="/farmer/products" 
            element={<ProtectedRoute element={<Products />} requiredRole="FARMER" />} 
          />
          <Route 
            path="/farmer/inventory" 
            element={<ProtectedRoute element={<Inventory />} requiredRole="FARMER" />} 
          />
          <Route 
            path="/farmer/orders" 
            element={<ProtectedRoute element={<Orders />} requiredRole="FARMER" />} 
          />
          <Route 
            path="/farmer/analytics" 
            element={<ProtectedRoute element={<Analytics />} requiredRole="FARMER" />} 
          />
          <Route 
            path="/farmer/products/edit/:productId" 
            element={<ProtectedRoute element={<EditProductForm />} requiredRole="FARMER" />} 
          />

          {/* Protected Consumer Routes */}
          <Route 
            path="/consumer/dashboard" 
            element={<ProtectedRoute element={<ConsumerDashboard />} requiredRole="CONSUMER" />} 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute element={<AdminDashboard />} requiredRole="ADMIN" />} 
          />
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute element={<UserList />} requiredRole="ADMIN" />} 
          />
          <Route 
            path="/admin/categories" 
            element={<ProtectedRoute element={<CategoryList />} requiredRole="ADMIN" />} 
          />
          <Route 
            path="/admin/orders" 
            element={<ProtectedRoute element={<OrderList />} requiredRole="ADMIN" />} 
          />
          <Route 
            path="/admin/products" 
            element={<ProtectedRoute element={<ProductList />} requiredRole="ADMIN" />} 
          />

          {/* 404 Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;