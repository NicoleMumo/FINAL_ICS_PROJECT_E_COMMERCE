import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Drawer,
  Snackbar,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  ReceiptLong as ReceiptLongIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const [categoryFilters, setCategoryFilters] = useState({});
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [exactPrice, setExactPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage if available
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userName, setUserName] = useState("");
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState(''); // '', 'pending', 'success', 'error'
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [shippingAddress, setShippingAddress] = useState("");
  const [addressStatus, setAddressStatus] = useState("");
  const [cartError, setCartError] = useState("");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Get user name from localStorage (set during login)
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        console.log('Parsed user:', userObj);
        setUserName(userObj.name || "");
        setUserEmail(userObj.email || "");
      } catch (error) {
        console.error('Error parsing user:', error);
        setUserName("");
        setUserEmail("");
      }
    }
  }, []);

  // Fetch user address on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const userObj = JSON.parse(storedUser);
        const res = await axios.get(`/api/users/${userObj.id}`);
        setShippingAddress(res.data.address || "");
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchUser();
  }, []);

  // Move fetchProducts to top level
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      setFetchError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Poll for products every 5 seconds for live stock updates (background update, no loading spinner)
  useEffect(() => {
    const pollProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
      } catch (err) {
        // Optionally handle error
      }
    };
    const interval = setInterval(pollProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  // After successful checkout, refresh products
  useEffect(() => {
    if (checkoutStatus === 'success') {
      fetchProducts();
    }
  }, [checkoutStatus]);

  // Fetch consumer orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/orders/my-consumer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Combined Filtering and Sorting Logic ---
  let sortedProducts = [...products];
  if (sortBy === 'Price: Low to High') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'Price: High to Low') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'Newest') {
    sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const filteredProducts = sortedProducts.filter(product => {
    // Search filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description ? product.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);

    // Category filter
    const activeCategories = Object.keys(categoryFilters).filter((catId) => categoryFilters[catId]);
    let matchesCategory = true;
    if (activeCategories.length > 0) {
      matchesCategory = activeCategories.includes(String(product.categoryId));
    }

    // Price filter
    let matchesPrice = true;
    if (priceRange === 'under10') matchesPrice = product.price < 10;
    else if (priceRange === '10to25') matchesPrice = product.price >= 10 && product.price <= 25;
    else if (priceRange === '25to50') matchesPrice = product.price > 25 && product.price <= 50;
    else if (priceRange === 'over50') matchesPrice = product.price > 50;

    // Exact price filter
    let matchesExactPrice = true;
    if (exactPrice !== '') {
      matchesExactPrice = product.price === Number(exactPrice);
    }

    if (showInStockOnly && product.stock <= 0) return false;

    return matchesSearch && matchesCategory && matchesPrice && matchesExactPrice;
  });

  // Add to cart handler (prevent exceeding stock)
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + 1 > product.stock) {
        setCartError('Cannot add more than available stock!');
        setTimeout(() => setCartError(''), 2000);
        return prevCart;
      }
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutStatus('');
    setCheckoutMessage('');
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error('User not logged in');
      const userObj = JSON.parse(storedUser);
      const userId = userObj.id;
      const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
      const res = await axios.post('http://localhost:5000/api/orders', { userId, items, shippingAddress });
      setCheckoutStatus('pending');
      setCheckoutMessage('STK push sent! Please complete payment on your phone.');
      setTimeout(async () => {
        setCheckoutStatus('success');
        setCheckoutMessage('Payment successful! Thank you for your order.');
        setCart([]);
        localStorage.removeItem('cart');
        await fetchProducts(); // Refresh products after successful checkout
      }, 4000);
    } catch (err) {
      if (err.response?.data?.message && err.response.data.message.includes('outdated')) {
        setCheckoutStatus('error');
        setCheckoutMessage(err.response.data.message);
        await fetchProducts(); // Refresh products if stock is outdated
      } else {
        setCheckoutStatus('error');
        setCheckoutMessage(err.response?.data?.message || 'Checkout failed.');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      // Clear all storage
      localStorage.clear();
      // Close the profile drawer
      setProfileDrawerOpen(false);
      // Navigate to login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleAddressSave = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error('User not logged in');
      const userObj = JSON.parse(storedUser);
      await axios.put(`/api/users/${userObj.id}/address`, { address: shippingAddress });
      setAddressStatus('Address updated!');
      setTimeout(() => setAddressStatus(''), 2000);
    } catch (err) {
      setAddressStatus('Failed to update address');
      setTimeout(() => setAddressStatus(''), 2000);
    }
  };

  if (loading) return <Typography sx={{ p: 4 }}>Loading products...</Typography>;
  if (fetchError) return <Typography color="error" sx={{ p: 4 }}>{fetchError}</Typography>;

  return (
    <Box sx={{ backgroundColor: '#F9FBE7', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#FFFFFF', boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 30, color: '#4CAF50', mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              FarmDirect
            </Typography>
          </Box>
          <TextField
            variant="outlined"
            placeholder="Search fresh produce..."
            size="small"
            sx={{
              width: '40%',
              backgroundColor: '#F5F5F5',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                color: '#212121',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#757575', // Adjust placeholder color
                opacity: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#757575' }} />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Box>
            <IconButton sx={{ color: '#212121', mr: 1 }} onClick={() => setCartDrawerOpen(true)}>
              <ShoppingCartIcon />
              {cart.length > 0 && (
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: '#4CAF50',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Box>
              )}
            </IconButton>
            <IconButton sx={{ color: '#212121', mr: 1 }} onClick={() => setOrdersModalOpen(true)}>
              <ReceiptLongIcon />
            </IconButton>
            <IconButton sx={{ color: '#212121' }} onClick={() => setProfileDrawerOpen(true)}>
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Grid container spacing={3} sx={{ p: 3 }}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>Filters</Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#212121', mt: 3, mb: 1 }}>Categories</Typography>
            {categories.map((cat) => (
              <FormControlLabel
                key={cat.id}
                control={
                  <Checkbox
                    name={String(cat.id)}
                    checked={!!categoryFilters[cat.id]}
                    onChange={(event) => setCategoryFilters({
                      ...categoryFilters,
                      [event.target.name]: event.target.checked,
                    })}
                    sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }}
                  />
                }
                label={<Typography variant="body2" sx={{ color: '#212121' }}>{cat.name}</Typography>}
              />
            ))}

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#212121', mt: 3, mb: 1 }}>Price Range</Typography>
            <RadioGroup value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
              <FormControlLabel
                value=""
                control={<Radio size="small" sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />}
                label={<Typography variant="body2" sx={{ color: '#212121' }}>All</Typography>}
              />
              <FormControlLabel
                value="under10"
                control={<Radio size="small" sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />}
                label={<Typography variant="body2" sx={{ color: '#212121' }}>Under Ksh10</Typography>}
              />
              <FormControlLabel
                value="10to25"
                control={<Radio size="small" sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />}
                label={<Typography variant="body2" sx={{ color: '#212121' }}>Ksh10 - Ksh25</Typography>}
              />
              <FormControlLabel
                value="25to50"
                control={<Radio size="small" sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />}
                label={<Typography variant="body2" sx={{ color: '#212121' }}>Ksh25 - Ksh50</Typography>}
              />
              <FormControlLabel
                value="over50"
                control={<Radio size="small" sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />}
                label={<Typography variant="body2" sx={{ color: '#212121' }}>Over Ksh50</Typography>}
              />
            </RadioGroup>

            <TextField
              label="Exact Price (Ksh)"
              type="number"
              variant="outlined"
              size="small"
              value={exactPrice}
              onChange={(event) => {
                // Only allow whole numbers
                const val = event.target.value;
                if (val === '' || /^[0-9]+$/.test(val)) setExactPrice(val);
              }}
              sx={{ mt: 2, width: '100%' }}
              inputProps={{ min: 0, step: 1 }}
            />

            <Button
              variant={showInStockOnly ? 'contained' : 'outlined'}
              color="success"
              fullWidth
              sx={{ mt: 2, mb: 2 }}
              onClick={() => setShowInStockOnly((prev) => !prev)}
            >
              {showInStockOnly ? 'Showing In Stock Only' : 'Show In Stock Only'}
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                // Logic to apply filters
                console.log('Applying Filters:', { categoryFilters, priceRange });
              }}
              sx={{
                mt: 3,
                bgcolor: '#212121',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#4CAF50' }
              }}
            >
              Apply Filters
            </Button>
          </Paper>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 2 }}>
              {userName ? `Welcome back ${userName}` : "Welcome back!"}
            </Typography>
            <FormControl variant="outlined" size="small">
              <InputLabel sx={{ color: '#212121' }}>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                  color: '#212121',
                  minWidth: 120
                }}
              >
                <MenuItem value="Featured">Featured</MenuItem>
                <MenuItem value="Price: Low to High">Price: Low to High</MenuItem>
                <MenuItem value="Price: High to Low">Price: High to Low</MenuItem>
                <MenuItem value="Newest">Newest</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} lg={4}>
                <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 180,
                      backgroundColor: '#E0E0E0',
                      borderRadius: 1,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#757575'
                    }}
                  >
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/180x180?text=No+Image'}
                      alt={product.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 'inherit' }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121', mb: 0.5 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                    {product.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', mb: 1, fontWeight: 'bold' }}>
                    In Stock: {product.stock}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Sold by: {product.farmer?.name || 'Unknown'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      Ksh{product.price} {product.category && product.category.unit ? `/ ${product.category.unit}` : ''}
                    </Typography>
                    {product.stock > 0 ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddToCart(product)}
                        sx={{ mt: 1 }}
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <Button variant="contained" color="error" disabled sx={{ mt: 1 }}>
                        Out of Stock
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Drawer anchor="right" open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)}>
        <Box sx={{ width: 350, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Your Cart</Typography>
            <IconButton onClick={() => setCartDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          {cart.length === 0 ? (
            <Typography sx={{ mt: 4 }}>Your cart is empty.</Typography>
          ) : (
            <>
              {cart.map((item) => (
                <Box key={item.id} sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                  <Typography variant="subtitle1">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Ksh{item.price} x {item.quantity}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Button size="small" onClick={() => setCart(cart => cart.map(i => i.id === item.id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i))}>-</Button>
                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                    <Button size="small" onClick={() => setCart(cart => cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}>+</Button>
                    <Button size="small" color="error" onClick={() => setCart(cart => cart.filter(i => i.id !== item.id))} sx={{ ml: 2 }}>Remove</Button>
                  </Box>
                </Box>
              ))}
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Total: Ksh{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleCheckout}
                disabled={checkoutLoading || cart.length === 0}
              >
                {checkoutLoading ? 'Processing...' : 'Checkout'}
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Profile Drawer */}
      <Drawer 
        anchor="right" 
        open={profileDrawerOpen} 
        onClose={() => setProfileDrawerOpen(false)}
        PaperProps={{
          sx: { width: 300 }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Profile</Typography>
            <IconButton onClick={() => setProfileDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <b>Name:</b> {userName || 'Not available'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Email:</b> {userEmail || 'Not available'}
          </Typography>
          {/* Shipping Address Section (moved here) */}
          <Box sx={{ mb: 2, p: 2, background: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Shipping Address</Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              placeholder="Enter your shipping address"
              sx={{ mb: 1 }}
            />
            <Button variant="contained" onClick={handleAddressSave} sx={{ bgcolor: '#4CAF50', color: '#212121' }}>
              Save Address
            </Button>
            {addressStatus && <Typography sx={{ ml: 2, color: addressStatus.includes('updated') ? 'green' : 'red' }}>{addressStatus}</Typography>}
          </Box>
          <Button 
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Snackbar open={!!checkoutStatus} autoHideDuration={5000} onClose={() => setCheckoutStatus('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        {checkoutStatus === 'success' ? (
          <Alert severity="success" onClose={() => setCheckoutStatus('')}>{checkoutMessage}</Alert>
        ) : checkoutStatus === 'pending' ? (
          <Alert severity="info" onClose={() => setCheckoutStatus('')}>{checkoutMessage}</Alert>
        ) : checkoutStatus === 'error' ? (
          <Alert severity="error" onClose={() => setCheckoutStatus('')}>{checkoutMessage}</Alert>
        ) : null}
      </Snackbar>

      {/* Show cart error if any */}
      {cartError && (
        <Snackbar open={!!cartError} autoHideDuration={2000} onClose={() => setCartError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setCartError('')}>{cartError}</Alert>
        </Snackbar>
      )}

      {/* Order History Dialog */}
      <Dialog open={ordersModalOpen} onClose={() => setOrdersModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>My Orders</DialogTitle>
        <DialogContent>
          {orders.length === 0 ? (
            <Typography>No previous orders found.</Typography>
          ) : (
            <Paper sx={{ p: 2, boxShadow: 2 }}>
              {orders.map(order => (
                <Box key={order.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">Order #{order.id}</Typography>
                    <Chip label={order.status} color={
                      order.status === 'COMPLETED' ? 'success' :
                      order.status === 'DELIVERED' ? 'primary' :
                      order.status === 'SHIPPED' ? 'info' :
                      order.status === 'PROCESSING' ? 'warning' :
                      order.status === 'CANCELLED' ? 'error' :
                      'default'
                    } />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    {order.items.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography>{item.product?.name} x {item.quantity}</Typography>
                        <Typography>Ksh{item.price}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Paper>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ConsumerDashboard; 