import React from 'react';
import { Box, Button, Typography, Grid, Paper, AppBar, Toolbar, Link, Container, Divider } from '@mui/material';
import { School, Favorite, LocalShipping, CheckCircleOutline, Nature, Spa, Person, Facebook, Twitter, Instagram, LinkedIn, Phone, Email, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import HeroImage from '../assets/Hero.jpeg';

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
              FarmDirect
            </Typography>
          </Box>
          <Box>
            <Button component={Link} onClick={() => navigate('/')} sx={{ mx: 1, color: '#4CAF50', textTransform: 'none', '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' } }}>Home</Button>
            <Button component={Link} sx={{ mx: 1, color: '#4CAF50', textTransform: 'none', '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' } }}>About Us</Button>
            <Button component={Link} sx={{ mx: 1, color: '#4CAF50', textTransform: 'none', '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' } }}>How It Works</Button>
            <Button component={Link} sx={{ mx: 1, color: '#4CAF50', textTransform: 'none', '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' } }}>Shop Produce</Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                mr: 1,
                bgcolor: '#4CAF50',
                color: '#212121',
                '&:hover': { bgcolor: '#388E3C' }
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#4CAF50',
                color: '#212121',
                '&:hover': { bgcolor: '#388E3C' }
              }}
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          py: 8, 
          textAlign: 'center',
          backgroundImage: `url(${HeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for better text readability
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, py: 12 }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', color: '#FFFFFF', mb: 2 }}>
            Fresh From Our Farms, Straight to Your Table
          </Typography>
          <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 4 }}>
            Connecting you directly with local farmers for the freshest, most delicious produce. Taste the difference of local.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: '#4CAF50',
              color: '#212121',
              '&:hover': { bgcolor: '#388E3C' },
              px: 4, py: 1.5, fontSize: '1.1rem'
            }}
          >
            Shop Fresh Produce
          </Button>
        </Box>
      </Box>

      {/* Our Commitment to You Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>
          Our Commitment to You
        </Typography>
        <Typography variant="body1" sx={{ color: '#212121', mb: 6 }}>
          At Farm Direct, we are dedicated to fostering a sustainable food system that benefits everyone.
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
            name="Maria Nkirote Amayo"
            location="Green Pastures Farm, Embu"
            description="Specializing in organic heirloom tomatoes and leafy greens, Maria's farm has been a community staple for generations."
          />
          <FarmerCard
            name="John Njoroge"
            location="Golden Harvest Farm, Nyeri"
            description="John cultivates a wide range of apples and berries, using traditional methods passed down through his family."
          />
          <FarmerCard
            name="Sarah Ochieng"
            location="Riverside Milk, Kisumu"
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
            author="Emily Rameyo"
            role="Urban Consumer"
          />
          <TestimonialCard
            quote="Selling our produce through FarmLink has been a game-changer for our small farm. We reach so many more customers now."
            author="David Lema"
            role="Local Farmer"
          />
          <TestimonialCard
            quote="The quality and variety of produce on FarmLink are unmatched. It's like having a farmers market delivered to my door every week!"
            author="Sophia Kimani Ken"
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
      <Box sx={{ py: 8, textAlign: 'center', backgroundColor: '#F5F5F5' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#212121', mb: 2 }}>
          Join the FarmLink Community Today!
        </Typography>
        <Typography variant="body1" sx={{ color: '#212121', mb: 4 }}>
          Whether you're looking to shop fresh produce or share your harvest, we've got you covered.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: '#4CAF50',
              color: '#212121',
              '&:hover': { bgcolor: '#388E3C' },
              px: 4,
              py: 2,
              fontSize: '1.1rem'
            }}
          >
            Start Shopping Now
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: '#4CAF50',
              color: '#212121',
              '&:hover': { bgcolor: '#388E3C' },
              px: 4,
              py: 2,
              fontSize: '1.1rem'
            }}
          >
            Become a Farmer
          </Button>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 6, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleOutline sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  FarmDirect
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Connecting farmers and consumers for fresher, better food.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Facebook sx={{ cursor: 'pointer', '&:hover': { color: '#4CAF50' } }} />
                <Twitter sx={{ cursor: 'pointer', '&:hover': { color: '#4CAF50' } }} />
                <Instagram sx={{ cursor: 'pointer', '&:hover': { color: '#4CAF50' } }} />
                <LinkedIn sx={{ cursor: 'pointer', '&:hover': { color: '#4CAF50' } }} />
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Quick Links
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button 
                    onClick={() => navigate('/about')}
                    sx={{ color: 'white', display: 'block', textAlign: 'left', '&:hover': { color: '#4CAF50' } }}
                  >
                    About Us
                  </Button>
                  <Button 
                    onClick={() => navigate('/products')}
                    sx={{ color: 'white', display: 'block', textAlign: 'left', '&:hover': { color: '#4CAF50' } }}
                  >
                    Products
                  </Button>
                  <Button 
                    onClick={() => navigate('/farmers')}
                    sx={{ color: 'white', display: 'block', textAlign: 'left', '&:hover': { color: '#4CAF50' } }}
                  >
                    Our Farmers
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    onClick={() => navigate('/contact')}
                    sx={{ color: 'white', display: 'block', textAlign: 'left', '&:hover': { color: '#4CAF50' } }}
                  >
                    Contact
                  </Button>
                  <Button 
                    onClick={() => navigate('/faq')}
                    sx={{ color: 'white', display: 'block', textAlign: 'left', '&:hover': { color: '#4CAF50' } }}
                  >
                    FAQ
                  </Button>
                  <Button 
                    onClick={() => navigate('/blog')}
                    sx={{ color: 'white', display: 'block', textAlign: 'left', '&:hover': { color: '#4CAF50' } }}
                  >
                    Blog
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography variant="body2">
                  123 Farm Street, Nairobi, Kenya
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 1 }} />
                <Typography variant="body2">
                  +254 123 456 789
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1 }} />
                <Typography variant="body2">
                  info@farmdirect.com
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Copyright */}
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            © {new Date().getFullYear()} FarmDirect. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 