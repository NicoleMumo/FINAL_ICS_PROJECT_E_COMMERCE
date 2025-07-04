// server/src/controllers/productController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all products (for Products and Inventory pages)
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
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
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
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
    if (req.userData.role !== "FARMER") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only farmers can add products." });
    }

    const { name, description, price, stock, imageUrl, categoryId } = req.body;

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

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID provided." });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl || null,
        categoryId,
        farmerId: req.userData.userId,
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
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, categoryId } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(categoryId !== undefined && { categoryId }),
      },
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
    if (req.userData.role !== "FARMER" && req.userData.role !== "ADMIN") {
      return res
        .status(403)
        .json({
          message: "Forbidden: Only farmers or admins can delete products.",
        });
    }
    const { id } = req.params;
    await prisma.product.delete({
      where: { id },
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
