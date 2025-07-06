// server/src/index.js
const express = require("express"); // This is the first and ONLY time express should be declared
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");

// If your .env is in 'server/' and index.js is in 'server/src/',
// you need to go one level up to find the .env file.
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes (publicly accessible for login/register)
app.use("/api/auth", authRoutes);

// Protected routes (apply authMiddleware to these)
// This applies authMiddleware to ALL routes defined in productRoutes, orderRoutes, categoryRoutes
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", categoryRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", adminRoutes);

app.get("/", (req, res) => {
  res.send("FarmDirect Backend API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
