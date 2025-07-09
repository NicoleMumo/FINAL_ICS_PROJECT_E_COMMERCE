import React from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingBasket as ShoppingBasketIcon,
} from "@mui/icons-material";
import AdminLayout from "../../layouts/AdminLayout";

export default function Dashboard() {
  const theme = useTheme();

  const cards = [
    {
      title: "Manage Users",
      icon: (
        <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      ),
      description: "View and manage user accounts",
      link: "/admin/users",
    },
    {
      title: "Manage Products",
      icon: (
        <InventoryIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      description: "Add, edit, and remove products",
      link: "/admin/products",
    },
    {
      title: "Manage Categories",
      icon: (
        <CategoryIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      description: "Organize product categories",
      link: "/admin/categories",
    },
    {
      title: "Manage Orders",
      icon: (
        <ShoppingBasketIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      description: "Track and process orders",
      link: "/admin/orders",
    },
  ];

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Welcome to Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your e-commerce platform from one central location
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              component={Link}
              to={card.link}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                  backgroundColor: theme.palette.primary.light,
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.1)",
                  },
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& .MuiSvgIcon-root": {
                      transition: "transform 0.2s",
                    },
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h2"
                  color="text.primary"
                  gutterBottom
                >
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AdminLayout>
  );
}
