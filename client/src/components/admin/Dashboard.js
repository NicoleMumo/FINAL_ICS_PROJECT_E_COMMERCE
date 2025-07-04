import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as UsersIcon,
  Storefront as ProductsIcon,
  ShoppingCart as OrdersIcon,
  Description as ReportsIcon,
  ReportProblem as ReportedIssuesIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const AdminDashboard = () => {
  // Dummy Data (replace with actual data from your backend)
  const totalUsers = 12345;
  const totalProducts = 8976;
  const totalOrders = 3421;
  const revenue = 45678;

  const recentActivity = [
    {
      id: 1,
      user: 'John Farmer',
      action: 'Created new product',
      date: '2025-01-15',
      status: 'Active',
      avatar: 'https://via.placeholder.com/30'
    },
    {
      id: 2,
      user: 'Sarah Consumer',
      action: 'Placed order #1234',
      date: '2025-01-14',
      status: 'Pending',
      avatar: 'https://via.placeholder.com/30'
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FBE7' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 240,
          flexShrink: 0,
          backgroundColor: '#FFFFFF',
          boxShadow: 3,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121' }}>
            Admin Panel
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <List sx={{ flexGrow: 1 }}>
          <ListItem button selected>
            <ListItemIcon><DashboardIcon sx={{ color: '#4CAF50' }} /></ListItemIcon>
            <ListItemText primary="Dashboard" sx={{ color: '#212121' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><UsersIcon sx={{ color: '#212121' }} /></ListItemIcon>
            <ListItemText primary="Users" sx={{ color: '#212121' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><ProductsIcon sx={{ color: '#212121' }} /></ListItemIcon>
            <ListItemText primary="Products" sx={{ color: '#212121' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><OrdersIcon sx={{ color: '#212121' }} /></ListItemIcon>
            <ListItemText primary="Orders" sx={{ color: '#212121' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><ReportsIcon sx={{ color: '#212121' }} /></ListItemIcon>
            <ListItemText primary="Reports" sx={{ color: '#212121' }} />
          </ListItem>
          <ListItem button>
            <ListItemIcon><ReportedIssuesIcon sx={{ color: '#212121' }} /></ListItemIcon>
            <ListItemText primary="Reported Issues" sx={{ color: '#212121' }} />
          </ListItem>
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <AppBar position="static" sx={{ backgroundColor: '#FFFFFF', boxShadow: 1, borderRadius: 2, mb: 3 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#212121' }}>
                Dashboard Overview
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                variant="outlined"
                placeholder="Search..."
                size="small"
                sx={{
                  width: 200,
                  backgroundColor: '#F5F5F5',
                  borderRadius: 1,
                  mr: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'transparent' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                    color: '#212121',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#757575',
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
              />
              <IconButton sx={{ color: '#212121' }}>
                <PersonIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Total Users Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#212121' }}>Total Users</Typography>
                <UsersIcon sx={{ color: '#757575' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121' }}>{totalUsers.toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>+12% from last month</Typography>
            </Paper>
          </Grid>
          {/* Total Products Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#212121' }}>Total Products</Typography>
                <ProductsIcon sx={{ color: '#757575' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121' }}>{totalProducts.toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>+5% from last month</Typography>
            </Paper>
          </Grid>
          {/* Total Orders Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#212121' }}>Total Orders</Typography>
                <OrdersIcon sx={{ color: '#757575' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121' }}>{totalOrders.toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>+18% from last month</Typography>
            </Paper>
          </Grid>
          {/* Revenue Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#212121' }}>Revenue</Typography>
                <Typography variant="body2" sx={{ fontSize: '1.5rem', color: '#757575' }}>Ksh</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#212121' }}>Ksh{revenue.toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>+23% from last month</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* User Growth & Transaction Volume Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" sx={{ color: '#757575' }}>Line Chart - User Growth Over Time</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" sx={{ color: '#757575' }}>Bar Chart - Monthly Transactions</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: '#FFFFFF', boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>Recent Activity</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#212121' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={activity.avatar} sx={{ width: 30, height: 30, mr: 1 }} />
                            <Typography variant="body2" sx={{ color: '#212121' }}>{activity.user}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2" sx={{ color: '#212121' }}>{activity.action}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ color: '#212121' }}>{activity.date}</Typography></TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: activity.status === 'Pending' ? '#E53935' : '#43A047',
                              fontWeight: 'bold'
                            }}
                          >
                            {activity.status}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" sx={{ mr: 1 }}><EditIcon sx={{ color: '#0288D1' }} /></IconButton>
                          <IconButton size="small"><DeleteIcon sx={{ color: '#E53935' }} /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 