// seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid"); // Import UUID generator

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // Hashed password for dummy users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Dummy Users
  const farmerUser = await prisma.user.upsert({
    where: { phone: "254712345678" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Farmer John",
      email: "john@farmdirect.com",
      phone: "254712345678",
      password: hashedPassword,
      role: "FARMER",
      farmName: "John's Organic Farm",
      location: "Nairobi",
      address: "Farm Lane 123, Nairobi",
    },
  });
  console.log(`Created farmer: ${farmerUser.name}`);

  const consumerUser = await prisma.user.upsert({
    where: { phone: "254700000001" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Alice Consumer",
      email: "alice@example.com",
      phone: "254700000001",
      password: hashedPassword, // Consumer might also have a password for web login
      role: "CONSUMER",
      address: "Apartment 4B, City Center, Kisumu",
    },
  });
  console.log(`Created consumer: ${consumerUser.name}`);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@farmdirect.com" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Admin User",
      email: "admin@farmdirect.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`Created admin: ${adminUser.name}`);

  // 2. Create Dummy Categories
  const categoryVegetables = await prisma.category.upsert({
    where: { name: "Vegetables" },
    update: {},
    create: { id: uuidv4(), name: "Vegetables" },
  });
  console.log(`Created category: ${categoryVegetables.name}`);

  const categoryFruits = await prisma.category.upsert({
    where: { name: "Fruits" },
    update: {},
    create: { id: uuidv4(), name: "Fruits" },
  });
  console.log(`Created category: ${categoryFruits.name}`);

  const categoryDairy = await prisma.category.upsert({
    where: { name: "Dairy" },
    update: {},
    create: { id: uuidv4(), name: "Dairy" },
  });
  console.log(`Created category: ${categoryDairy.name}`);

  // 3. Create Dummy Products
  // Note: Your Product model doesn't have a direct link to a User (farmer) in the schema.
  // In a real app, you'd likely add a `farmerId` field to `Product` linked to `User`.
  // For now, these products are just created and can be imagined as belonging to Farmer John.
  const productTomatoes = await prisma.product.upsert({
    where: { name: "Organic Tomatoes" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Organic Tomatoes",
      description: "Freshly picked organic tomatoes from our farm.",
      price: 4.5,
      stock: 45,
      imageUrl: "https://placehold.co/150x150/4CAF50/FFFFFF?text=Tomatoes",
      categoryId: categoryVegetables.id,
      farmerId: farmerUser.id,
    },
  });
  console.log(`Created product: ${productTomatoes.name}`);

  const productCarrots = await prisma.product.upsert({
    where: { name: "Fresh Carrots" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Fresh Carrots",
      description: "Sweet and crunchy carrots, perfect for snacks or cooking.",
      price: 3.2,
      stock: 8, // Low stock for testing low stock alerts
      imageUrl: "https://placehold.co/150x150/FF9800/FFFFFF?text=Carrots",
      categoryId: categoryVegetables.id,
      farmerId: farmerUser.id,
    },
  });
  console.log(`Created product: ${productCarrots.name}`);

  const productAvocadoes = await prisma.product.upsert({
    where: { name: "Hass Avocadoes" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Hass Avocadoes",
      description: "Ripe Hass avocadoes, creamy and delicious.",
      price: 2.8,
      stock: 30,
      imageUrl: "https://placehold.co/150x150/8BC34A/FFFFFF?text=Avocado",
      categoryId: categoryFruits.id,
      farmerId: farmerUser.id,
    },
  });
  console.log(`Created product: ${productAvocadoes.name}`);

  const productMilk = await prisma.product.upsert({
    where: { name: "Fresh Farm Milk (1 Litre)" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Fresh Farm Milk (1 Litre)",
      description: "Pasteurized fresh cow milk, 1-litre pack.",
      price: 1.5,
      stock: 15,
      imageUrl: "https://placehold.co/150x150/B3E5FC/FFFFFF?text=Milk",
      categoryId: categoryDairy.id,
      farmerId: farmerUser.id,
    },
  });
  console.log(`Created product: ${productMilk.name}`);

  // 4. Create Dummy Orders
  const order1 = await prisma.order.upsert({
    where: { id: "order1-uuid-pending" }, // Use a unique ID for upsert logic
    update: {},
    create: {
      id: "order1-uuid-pending", // Manually assign a UUID for easier upsert management
      userId: consumerUser.id,
      status: "PENDING",
      total: productTomatoes.price * 5 + productCarrots.price * 3, // 22.5 + 9.6 = 32.1
      items: {
        create: [
          {
            productId: productTomatoes.id,
            quantity: 5,
            price: productTomatoes.price,
          },
          {
            productId: productCarrots.id,
            quantity: 3,
            price: productCarrots.price,
          },
        ],
      },
      createdAt: new Date("2025-01-11T10:00:00Z"), // Specific date for testing
    },
  });
  console.log(`Created pending order: ${order1.id}`);

  const order2 = await prisma.order.upsert({
    where: { id: "order2-uuid-shipped" },
    update: {},
    create: {
      id: "order2-uuid-shipped",
      userId: consumerUser.id,
      status: "SHIPPED",
      total: productAvocadoes.price * 4 + productMilk.price * 2, // 11.2 + 3.0 = 14.2
      items: {
        create: [
          {
            productId: productAvocadoes.id,
            quantity: 4,
            price: productAvocadoes.price,
          },
          {
            productId: productMilk.id,
            quantity: 2,
            price: productMilk.price,
          },
        ],
      },
      createdAt: new Date("2025-01-14T14:30:00Z"),
    },
  });
  console.log(`Created shipped order: ${order2.id}`);

  const order3 = await prisma.order.upsert({
    where: { id: "order3-uuid-delivered" },
    update: {},
    create: {
      id: "order3-uuid-delivered",
      userId: consumerUser.id,
      status: "DELIVERED",
      total: productTomatoes.price * 2, // 9.0
      items: {
        create: [
          {
            productId: productTomatoes.id,
            quantity: 2,
            price: productTomatoes.price,
          },
        ],
      },
      createdAt: new Date("2025-01-05T08:15:00Z"),
    },
  });
  console.log(`Created delivered order: ${order3.id}`);
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Seeding finished.");
  });
