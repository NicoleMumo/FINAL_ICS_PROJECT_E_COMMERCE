const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Passwords for test users
  const farmerPassword = "farmer123";
  const consumerPassword = "consumer123";
  const adminPassword = "admin123";

  // Hash passwords
  const hashedFarmerPassword = await bcrypt.hash(farmerPassword, 10);
  const hashedConsumerPassword = await bcrypt.hash(consumerPassword, 10);
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  // Create categories
  const fruits = await prisma.category.upsert({
    where: { name: "Fruits" },
    update: {},
    create: { name: "Fruits" },
  });
  const vegetables = await prisma.category.upsert({
    where: { name: "Vegetables" },
    update: {},
    create: { name: "Vegetables" },
  });

  // Create users
  const farmer = await prisma.user.upsert({
    where: { email: "farmer1@example.com" },
    update: {},
    create: {
      name: "Farmer One",
      email: "farmer1@example.com",
      phone: "0700000001",
      password: hashedFarmerPassword,
      role: "FARMER",
      farmName: "Green Acres",
      location: "Nairobi",
      address: "123 Farm Lane",
    },
  });

  const consumer = await prisma.user.upsert({
    where: { email: "consumer1@example.com" },
    update: {},
    create: {
      name: "Consumer One",
      email: "consumer1@example.com",
      phone: "0700000002",
      password: hashedConsumerPassword,
      role: "CONSUMER",
      location: "Nairobi",
      address: "456 City Road",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin1@example.com" },
    update: {},
    create: {
      name: "Admin One",
      email: "admin1@example.com",
      phone: "0700000003",
      password: hashedAdminPassword,
      role: "ADMIN",
      location: "Nairobi",
      address: "789 Admin Blvd",
    },
  });

  // Create products for the farmer
  await prisma.product.createMany({
    data: [
      {
        name: "Red Apples",
        description: "Fresh red apples from the farm.",
        price: 120.0,
        stock: 50,
        imageUrl: null,
        categoryId: fruits.id,
        farmerId: farmer.id,
      },
      {
        name: "Spinach Bunch",
        description: "Organic spinach, freshly harvested.",
        price: 60.0,
        stock: 100,
        imageUrl: null,
        categoryId: vegetables.id,
        farmerId: farmer.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create an order for the consumer
  const product = await prisma.product.findFirst({ where: { name: "Red Apples" } });
  const order = await prisma.order.create({
    data: {
      userId: consumer.id,
      status: "PENDING",
      total: 240.0,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2,
            price: 120.0,
          },
        ],
      },
    },
  });

  console.log("Seed data created successfully!");
  console.log("Test users and their passwords:");
  console.log("Farmer: farmer1@example.com / farmer123");
  console.log("Consumer: consumer1@example.com / consumer123");
  console.log("Admin: admin1@example.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });