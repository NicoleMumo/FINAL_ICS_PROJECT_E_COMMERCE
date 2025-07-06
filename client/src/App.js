// src/App.js
import React, { useEffect } from "react"; // Import useEffect
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios"; // Import axios here

// General Home Page
import Home from "./components/Home";

// Farmer Portal Components (all located in src/components/farmer/)
import Dashboard from "./components/farmer/Dashboard";
import AddProductForm from "./components/farmer/AddProductForm";
import Products from "./components/farmer/Products";
import Inventory from "./components/farmer/Inventory";
import Orders from "./components/farmer/Orders";
import Analytics from "./components/farmer/Analytics";
import EditProductForm from "./components/farmer/EditProductForm"; // Import EditProductForm

// Consumer Portal Components
import ConsumerDashboard from "./components/consumer/Dashboard";

// Admin Portal Components
import AdminDashboard from './components/admin/AdminDashboard';

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

// --- AXIOS INTERCEPTOR CONFIGURATION ---
// This will run once when the module is loaded.
axios.interceptors.request.use(
  config => {
  const token = localStorage.getItem('token');
    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
    return config;
  },
  error => {
    // Do something with request error
    return Promise.reject(error);
  }
);
// --- END AXIOS INTERCEPTOR CONFIGURATION ---

function App() {
  // useEffect is not strictly needed for the interceptor here, as it's outside the component
  // but it can be used for debugging or other global setup if required.
  // For instance, you could log when the interceptor is set up:
  useEffect(() => {
    console.log('App component mounted. Axios interceptor should be active.');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />{" "}
      {/* Provides a consistent baseline for CSS across browsers */}
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect for generic /dashboard to prevent direct access without role */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />

          {/* Farmer Portal Routes (now public) */}
          <Route path="/farmer/dashboard" element={<Dashboard />} />
          <Route path="/farmer/add-product" element={<AddProductForm />} />
          <Route path="/farmer/products" element={<Products />} />
          <Route path="/farmer/inventory" element={<Inventory />} />
          <Route path="/farmer/orders" element={<Orders />} />
          <Route path="/farmer/analytics" element={<Analytics />} />
          <Route path="/farmer/products/edit/:productId" element={<EditProductForm />} /> {/* Edit Product Route */}

          {/* Consumer Portal Route (now public) */}
          <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />

          {/* Admin Portal Route (now public) */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Catch-all route for any unhandled paths (404 Not Found) */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;