// src/components/farmer/EditProductForm.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  CircularProgress,
  IconButton,
  Alert,
  FormHelperText,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  DeleteForever as DeleteForeverIcon,
} from "@mui/icons-material";
import FarmerLayout from "../../layouts/FarmerLayout";

const API_BASE_URL = "http://localhost:5000/api";

const EditProductForm = () => {
  const navigate = useNavigate();
  const { productId } = useParams(); // Get product ID from URL
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [productImage, setProductImage] = useState(null); // Stores new File object
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // URL for new image preview
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // Stores existing product's image URL
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false); // Flag to remove existing image

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // For form submission
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true); // For initial product data fetch

  // Fetch product data and categories on component mount
  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        setFormLoading(true);
        setError(""); // Clear previous errors

        const token = localStorage.getItem("token");

        // Fetch categories first
        const categoriesResponse = await axios.get(
          `${API_BASE_URL}/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(categoriesResponse.data);

        // Fetch product data
        const productResponse = await axios.get(
          `${API_BASE_URL}/products/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const product = productResponse.data;

        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setSelectedCategory(product.categoryId);
        setCurrentImageUrl(product.imageUrl); // Set existing image URL

        // Set default category if categories are loaded and no product category is set
        if (categoriesResponse.data.length > 0 && !product.categoryId) {
          setSelectedCategory(categoriesResponse.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch product or categories:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        setFormLoading(false);
      }
    };
    fetchProductAndCategories();
  }, [productId]); // Depend on productId to re-fetch if it changes

  // Effect to handle new image preview
  useEffect(() => {
    if (productImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(productImage);
    } else {
      setImagePreviewUrl(null);
    }
  }, [productImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProductImage(file);
      setRemoveCurrentImage(false); // If new image is selected, don't remove old one
      setError("");
    } else {
      setProductImage(null);
      setImagePreviewUrl(null);
      setError("Please select a valid image file (JPG, PNG, GIF).");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveCurrentImageChange = (e) => {
    const checked = e.target.checked;
    setRemoveCurrentImage(checked);
    if (checked) {
      setProductImage(null); // If removing current, clear any newly selected image
      setImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !description || !price || !stock || !selectedCategory) {
      setError(
        "Please fill in all required fields (Name, Description, Price, Stock, Category)."
      );
      setLoading(false);
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      setError("Price must be a positive number.");
      setLoading(false);
      return;
    }
    if (isNaN(stock) || parseInt(stock) < 0) {
      setError("Stock must be a non-negative integer.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", parseFloat(price));
    formData.append("stock", parseInt(stock));
    formData.append("categoryId", selectedCategory);

    if (productImage) {
      formData.append("image", productImage); // <-- must match backend
    } else if (removeCurrentImage) {
      formData.append("removeImage", "true");
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        // Always PATCH for edit form
        `${API_BASE_URL}/products/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Product updated successfully!");
      setRemoveCurrentImage(false); // Reset after update

      // Update the current image URL with the new one from response if provided
      if (response.data.product.imageUrl) {
        setCurrentImageUrl(response.data.product.imageUrl);
      } else if (!response.data.product.imageUrl) {
        setCurrentImageUrl(null); // Image was removed
      }

      setTimeout(() => navigate("/farmer/products"), 2000); // Redirect to products list
    } catch (err) {
      console.error(
        "Error updating product:",
        err.response ? err.response.data : err
      );
      setError(
        err.response?.data?.message ||
          "Failed to update product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <FarmerLayout title="Edit Product">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout
      title="Edit Product"
      subtitle="Modify product details"
      showAddProduct={false}
    >
      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 600,
          backgroundColor: "#FFFFFF",
          boxShadow: 3,
          borderRadius: 2,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#212121" }}
          >
            Edit Product Details
          </Typography>
          <IconButton
            onClick={() => navigate("/farmer/products")}
            sx={{ color: "#212121" }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (Ksh)"
                variant="outlined"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputProps={{ step: "0.01" }}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                variant="outlined"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* --- Image Upload/Display Section --- */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                {/* Display current image if exists and not marked for removal and no new image selected */}
                {currentImageUrl && !removeCurrentImage && !productImage && (
                  <Box
                    sx={{
                      mt: 2,
                      mb: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Current Image:
                    </Typography>
                    <img
                      src={`${window.location.origin}${currentImageUrl}`}
                      alt="Current Product"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        mb: 1,
                      }}
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteForeverIcon />}
                      onClick={() => setRemoveCurrentImage(true)}
                      sx={{ mt: 1 }}
                    >
                      Remove Current Image
                    </Button>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                  disabled={removeCurrentImage} // Disable if user chose to remove current image
                >
                  {productImage
                    ? "Change Product Image"
                    : "Upload New Image (Optional)"}
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </Button>
                {productImage && (
                  <FormHelperText sx={{ mt: 1 }}>
                    Selected: {productImage.name}
                  </FormHelperText>
                )}
                {/* Show new image preview */}
                {imagePreviewUrl && (
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt="New Product Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                      }}
                    />
                  </Box>
                )}
                {/* Checkbox to confirm removal if an image exists and no new image is selected */}
                {currentImageUrl && !productImage && (
                  <FormGroup sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={removeCurrentImage}
                          onChange={handleRemoveCurrentImageChange}
                          color="error"
                        />
                      }
                      label="Remove existing product image"
                    />
                  </FormGroup>
                )}
                {!currentImageUrl && !productImage && (
                  <FormHelperText sx={{ mt: 1 }}>
                    No image currently, you can upload one.
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            {/* --- End Image Upload/Display Section --- */}

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Category"
                variant="outlined"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                sx={{ mb: 2 }}
                disabled={categoriesLoading || categories.length === 0}
              >
                {categoriesLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Loading
                    Categories...
                  </MenuItem>
                ) : categories.length === 0 ? (
                  <MenuItem disabled>No Categories Available</MenuItem>
                ) : (
                  categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                fullWidth
                sx={{
                  bgcolor: "#4CAF50",
                  "&:hover": { bgcolor: "#388E3C" },
                  py: 1.5,
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </FarmerLayout>
  );
};

export default EditProductForm;
