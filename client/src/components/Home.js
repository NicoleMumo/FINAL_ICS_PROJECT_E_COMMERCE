import React from 'react';
import { Box, Button, Typography, Grid, Paper, AppBar, Toolbar, Link } from '@mui/material';
import { School, Favorite, LocalShipping, CheckCircleOutline, Nature, Spa, Person } from '@mui/icons-material'; // Corrected Eco to Nature
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const CommitmentCard = ({ icon: Icon, title, description }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          boxShadow: 3,
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#212121' }}>
          {description}
        </Typography>
      </Paper>
    </Grid>
  );

  const FarmerCard = ({ name, location, description }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          boxShadow: 3,
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Placeholder for image */}
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: '#E0E0E0', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 0.5 }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#212121', mb: 1 }}>
          {location}
        </Typography>
        <Typography variant="body2" sx={{ color: '#212121' }}>
          {description}
        </Typography>
      </Paper>
    </Grid>
  );

  const TestimonialCard = ({ quote, author, role }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        sx={{
          p: 3,
          backgroundColor: '#FFFFFF',
          boxShadow: 3,
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#212121', mb: 2 }}>
          "{quote}"
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Person sx={{ fontSize: 30, color: '#4CAF50', mr: 1 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#212121' }}>
              {author}
            </Typography>
            <Typography variant="body2" sx={{ color: '#212121' }}>
              {role}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ backgroundColor: '#F9FBE7', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#FFFFFF', boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutline sx={{ fontSize: 30, color: '#4CAF50', mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              FarmLink
            </Typography>
          </Box>
          <Box>
            <Link component="button" onClick={() => navigate('/')} sx={{ mx: 1, color: '#212121', textTransform: 'none', '&:hover': { color: '#4CAF50' } }}>Home</Link>
            <Link component="button" onClick={() => {}} sx={{ mx: 1, color: '#212121', textTransform: 'none', '&:hover': { color: '#4CAF50' } }}>About Us</Link>
            <Link component="button" onClick={() => {}} sx={{ mx: 1, color: '#212121', textTransform: 'none', '&:hover': { color: '#4CAF50' } }}>How It Works</Link>
            <Link component="button" onClick={() => {}} sx={{ mx: 1, color: '#212121', textTransform: 'none', '&:hover': { color: '#4CAF50' } }}>Shop Produce</Link>
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                mr: 1,
                color: '#4CAF50',
                borderColor: '#4CAF50',
                '&:hover': { borderColor: '#388E3C', color: '#388E3C' }
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': { bgcolor: '#388E3C' }
              }}
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center', backgroundColor: '#FFFFFF' }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>
          Fresh From Our Farms, Straight to Your Table
        </Typography>
        <Typography variant="h6" sx={{ color: '#212121', mb: 4 }}>
          Connecting you directly with local farmers for the freshest, most delicious produce. Taste the difference of local.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#4CAF50',
            '&:hover': { bgcolor: '#388E3C' },
            px: 4, py: 1.5, fontSize: '1.1rem'
          }}
        >
          Shop Fresh Produce
        </Button>
      </Box>

      {/* Our Commitment to You Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>
          Our Commitment to You
        </Typography>
        <Typography variant="body1" sx={{ color: '#212121', mb: 6 }}>
          At FarmLink, we are dedicated to fostering a sustainable food system that benefits everyone.
        </Typography>
        <Grid container spacing={4} sx={{ px: { xs: 2, md: 8 } }}>
          <CommitmentCard
            icon={Spa}
            title="Freshness Guaranteed"
            description="Directly from local farms to your table, ensuring unparalleled freshness and quality."
          />
          <CommitmentCard
            icon={Favorite}
            title="Support Local Farmers"
            description="Empower small family farms by connecting them directly with consumers like you."
          />
          <CommitmentCard
            icon={LocalShipping}
            title="Efficient Delivery"
            description="Reliable and timely delivery services, bringing farm-fresh produce right to your door."
          />
          <CommitmentCard
            icon={CheckCircleOutline}
            title="Quality Assurance"
            description="Our rigorous standards ensure every product meets the highest benchmarks for safety and taste."
          />
          <CommitmentCard
            icon={School}
            title="Diverse Produce Selection"
            description="Explore a wide variety of seasonal fruits, vegetables, and artisan goods."
          />
          <CommitmentCard
            icon={Nature}
            title="Sustainable Practices"
            description="Supporting farms committed to eco-friendly and sustainable agricultural methods."
          />
        </Grid>
      </Box>

      {/* Meet Our Dedicated Farmers Section */}
      <Box sx={{ py: 8, textAlign: 'center', backgroundColor: '#F5F5F5' }}> {/* Lighter background for this section */}
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>
          Meet Our Dedicated Farmers
        </Typography>
        <Typography variant="body1" sx={{ color: '#212121', mb: 6 }}>
          Discover the passionate individuals behind the fresh produce you love.
        </Typography>
        <Grid container spacing={4} sx={{ px: { xs: 2, md: 8 } }}>
          <FarmerCard
            name="Maria Rodriguez"
            location="Green Pastures Farm, CA"
            description="Specializing in organic heirloom tomatoes and leafy greens, Maria's farm has been a community staple for generations."
          />
          <FarmerCard
            name="John Peterson"
            location="Golden Harvest Orchards, NY"
            description="John cultivates a wide range of apples and berries, using traditional methods passed down through his family."
          />
          <FarmerCard
            name="Sarah Chen"
            location="Riverside Dairy, WI"
            description="Sarah provides fresh, artisanal dairy products, committed to ethical farming and animal welfare."
          />
        </Grid>
      </Box>

      {/* What Our Community Says Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>
          What Our Community Says
        </Typography>
        <Typography variant="body1" sx={{ color: '#212121', mb: 6 }}>
          Hear from happy customers and farmers who are part of the FarmLink family.
        </Typography>
        <Grid container spacing={4} sx={{ px: { xs: 2, md: 8 } }}>
          <TestimonialCard
            quote="FarmLink has completely changed the way I buy groceries. The produce is incredibly fresh, and I love supporting local farmers!"
            author="Emily R."
            role="Urban Consumer"
          />
          <TestimonialCard
            quote="Selling our produce through FarmLink has been a game-changer for our small farm. We reach so many more customers now."
            author="David L."
            role="Local Farmer"
          />
          <TestimonialCard
            quote="The quality and variety of produce on FarmLink are unmatched. It's like having a farmers market delivered to my door every week!"
            author="Sophia K."
            role="Home Chef"
          />
        </Grid>
      </Box>

      {/* Our Impact at a Glance Section */}
      <Box sx={{ py: 8, textAlign: 'center', backgroundColor: '#F5F5F5' }}> {/* Lighter background for this section */}
        <Grid container spacing={4} justifyContent="space-around" alignItems="center" sx={{ px: { xs: 2, md: 8 } }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
              250+
            </Typography>
            <Typography variant="h6" sx={{ color: '#212121' }}>
              Farmers Connected
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
              10,000+
            </Typography>
            <Typography variant="h6" sx={{ color: '#212121' }}>
              Orders Delivered
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
              50+
            </Typography>
            <Typography variant="h6" sx={{ color: '#212121' }}>
              Communities Served
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Join the FarmLink Community Today! Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>
          Join the FarmLink Community Today!
        </Typography>
        <Typography variant="body1" sx={{ color: '#212121', mb: 4 }}>
          Experience the joy of fresh, local produce and support sustainable agriculture.
        </Typography>
        <Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#388E3C' },
              px: 4, py: 1.5, fontSize: '1.1rem', mr: 2
            }}
          >
            Start Shopping Now
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: '#4CAF50',
              borderColor: '#4CAF50',
              '&:hover': { borderColor: '#388E3C', color: '#388E3C' },
              px: 4, py: 1.5, fontSize: '1.1rem'
            }}
          >
            Become a Farmer
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Home; 