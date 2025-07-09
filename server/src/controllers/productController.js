// server/src/controllers/productController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

exports.upload = upload.single("image"); // "image" must match your frontend field name

// Get all products (for Products and Inventory pages)
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        farmer: { select: { id: true, name: true } },
      },
      orderBy: {
        name: "asc",
      },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, farmer: { select: { id: true, name: true } } },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Failed to fetch product." });
  }
};

// Add a new product (used by AddProductForm.js)
exports.addProduct = async (req, res) => {
  try {
    console.log("req.file:", req.file); // Add this line
    if (req.userData.role !== "FARMER") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only farmers can add products." });
    }

    const { name, description, price, stock, categoryId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !description || !price || stock === undefined || !categoryId) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }
    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number." });
    }
    if (isNaN(stock) || stock < 0) {
      return res
        .status(400)
        .json({ message: "Stock must be a non-negative integer." });
    }

    // Parse categoryId as integer
    const categoryIdInt = parseInt(categoryId);
    if (isNaN(categoryIdInt)) {
      return res.status(400).json({ message: "Invalid category ID provided." });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryIdInt },
    });
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID provided." });
    }

    // Parse farmerId as integer
    const farmerIdInt = parseInt(req.userData.userId);
    if (isNaN(farmerIdInt)) {
      return res.status(400).json({ message: "Invalid farmer ID." });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl || null,
        categoryId: categoryIdInt,
        farmerId: farmerIdInt,
      },
    });
    res
      .status(201)
      .json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return res
        .status(409)
        .json({ message: "A product with this name already exists." });
    }
    res.status(500).json({ message: "Failed to add product." });
  }
};

// Update product details (e.g., stock from Inventory.js)
exports.updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const farmerId = parseInt(req.userData.userId, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.farmerId !== farmerId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this product." });
    }

    const { name, description, price, stock, categoryId, removeCurrentImage } =
      req.body;

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(stock && { stock: parseInt(stock) }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    } else if (removeCurrentImage === "true") {
      updateData.imageUrl = null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    res.json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found." });
    }
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      return res
        .status(409)
        .json({ message: "A product with this name already exists." });
    }
    res.status(500).json({ message: "Failed to update product." });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { role } = req.userData;
    const userId = parseInt(req.userData.userId, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Admins can delete any product. Farmers can only delete their own.
    if (role !== "ADMIN" && product.farmerId !== userId) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to delete this product.",
      });
    }

    await prisma.product.delete({
      where: { id: productId },
    });
    res.status(204).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(500).json({ message: "Failed to delete product." });
  }
};

// Get products for the logged-in farmer
exports.getMyProducts = async (req, res) => {
  try {
    const farmerId = parseInt(req.userData.userId, 10);
    const products = await prisma.product.findMany({
      where: { farmerId },
      include: { category: true },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching farmer's products:", error);
    res.status(500).json({ message: "Failed to fetch your products." });
  }
};

// Add a new product (used by Admin)
exports.adminAddProduct = async (req, res) => {
  try {
    if (req.userData.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can perform this action." });
    }

    const { name, description, price, stock, categoryId, farmerId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (
      !name ||
      !description ||
      !price ||
      stock === undefined ||
      !categoryId ||
      !farmerId
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl || null,
        categoryId: parseInt(categoryId),
        farmerId: parseInt(farmerId),
      },
    });
    res
      .status(201)
      .json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("Error adding product by admin:", error);
    res.status(500).json({ message: "Failed to add product." });
  }
};

// Update product details by Admin
exports.adminUpdateProduct = async (req, res) => {
  try {
    if (req.userData.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can perform this action." });
    }

    const { id } = req.params;
    const { name, description, price, stock, categoryId, removeCurrentImage } =
      req.body;

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(stock && { stock: parseInt(stock) }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    } else if (removeCurrentImage === "true") {
      updateData.imageUrl = null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product by admin:", error);
    res.status(500).json({ message: "Failed to update product." });
  }
};

// Update only the stock of a product
exports.updateStock = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { stock } = req.body;
    const farmerId = parseInt(req.userData.userId, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      return res
        .status(400)
        .json({ message: "A valid, non-negative stock quantity is required." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.farmerId !== farmerId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this product." });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: parseInt(stock),
      },
      include: {
        category: true, // Include category to match frontend data structure
      },
    });

    res.json({
      message: "Stock updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Failed to update stock." });
  }
};
