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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserName(userObj.name || "");
        setUserEmail(userObj.email || "");
      } catch {
        setUserName("");
        setUserEmail("");
      }
    }
  }, []);

  const handleCategoryChange = (event) => {
    setCategoryFilters({
      ...categoryFilters,
      [event.target.name]: event.target.checked,
    });
  };

  const handlePriceChange = (event) => {
    setPriceRange(event.target.value);
  };

  const handleApplyFilters = () => {
    // Logic to apply filters
    console.log('Applying Filters:', { categoryFilters, priceRange });
  };

  useEffect(() => {
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
    fetchProducts();
  }, []);

  // --- Combined Filtering Logic ---
  const filteredProducts = products.filter(product => {
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

    return matchesSearch && matchesCategory && matchesPrice && matchesExactPrice;
  });

  // Add to cart handler
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
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
      const res = await axios.post('http://localhost:5000/api/orders', { userId, items });
      setCheckoutStatus('pending');
      setCheckoutMessage('STK push sent! Please complete payment on your phone.');
      // Simulate polling for payment status (in real app, poll or use websocket)
      setTimeout(async () => {
        // Simulate backend payment callback
        // In real app, poll /api/orders/:id or listen for webhook
        setCheckoutStatus('success');
        setCheckoutMessage('Payment successful! Thank you for your order.');
        setCart([]);
        localStorage.removeItem('cart');
      }, 4000);
    } catch (err) {
      setCheckoutStatus('error');
      setCheckoutMessage(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setCheckoutLoading(false);
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
                    onChange={handleCategoryChange}
                    sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }}
                  />
                }
                label={<Typography variant="body2" sx={{ color: '#212121' }}>{cat.name}</Typography>}
              />
            ))}

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#212121', mt: 3, mb: 1 }}>Price Range</Typography>
            <RadioGroup value={priceRange} onChange={handlePriceChange}>
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
              onChange={e => {
                // Only allow whole numbers
                const val = e.target.value;
                if (val === '' || /^[0-9]+$/.test(val)) setExactPrice(val);
              }}
              sx={{ mt: 2, width: '100%' }}
              inputProps={{ min: 0, step: 1 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleApplyFilters}
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
              {userName ? `Welcome back: ${userName}` : "Welcome back!"}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      Ksh{product.price} /kg
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddToCart(product)}
                      sx={{ mt: 1 }}
                    >
                      Add to Cart
                    </Button>
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

      <Drawer anchor="right" open={profileDrawerOpen} onClose={() => setProfileDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Profile</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}><b>Email:</b> {userEmail}</Typography>
          <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }} disabled>
            Forgot Password (Coming Soon)
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
    </Box>
  );
};

export default ConsumerDashboard; 