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
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Fruits" },
      update: {},
      create: { name: "Fruits" },
    }),
    prisma.category.upsert({
      where: { name: "Vegetables" },
      update: {},
      create: { name: "Vegetables" },
    }),
    prisma.category.upsert({
      where: { name: "Dairy" },
      update: {},
      create: { name: "Dairy" },
    }),
    prisma.category.upsert({
      where: { name: "Meat" },
      update: {},
      create: { name: "Meat" },
    }),
    prisma.category.upsert({
      where: { name: "Grains" },
      update: {},
      create: { name: "Grains" },
    }),
  ]);

  // Create farmers
  const farmers = await Promise.all([
    prisma.user.upsert({
      where: { email: "farmer1@example.com" },
      update: {},
      create: {
        name: "Farmer One",
        email: "farmer1@example.com",
        phone: "0723456789",
        password: hashedFarmerPassword,
        role: "FARMER",
        farmName: "Green Acres",
        location: "Nairobi",
        address: "123 Farm Lane",
      },
    }),
    prisma.user.upsert({
      where: { email: "farmer2@example.com" },
      update: {},
      create: {
        name: "Farmer Two",
        email: "farmer2@example.com",
        phone: "0723456790",
        password: hashedFarmerPassword,
        role: "FARMER",
        farmName: "Fresh Fields",
        location: "Nakuru",
        address: "456 Farm Road",
      },
    }),
    prisma.user.upsert({
      where: { email: "farmer3@example.com" },
      update: {},
      create: {
        name: "Farmer Three",
        email: "farmer3@example.com",
        phone: "0723456791",
        password: hashedFarmerPassword,
        role: "FARMER",
        farmName: "Sunshine Farms",
        location: "Kiambu",
        address: "789 Garden Way",
      },
    }),
  ]);

  // Create consumers
  const consumers = await Promise.all([
    prisma.user.upsert({
      where: { email: "consumer1@example.com" },
      update: {},
      create: {
        name: "Consumer One",
        email: "consumer1@example.com",
        phone: "0723456792",
        password: hashedConsumerPassword,
        role: "CONSUMER",
        location: "Nairobi",
        address: "456 Market St",
      },
    }),
    prisma.user.upsert({
      where: { email: "consumer2@example.com" },
      update: {},
      create: {
        name: "Consumer Two",
        email: "consumer2@example.com",
        phone: "0723456793",
        password: hashedConsumerPassword,
        role: "CONSUMER",
        location: "Nairobi",
        address: "789 Shopping Ave",
      },
    }),
    prisma.user.upsert({
      where: { email: "consumer3@example.com" },
      update: {},
      create: {
        name: "Consumer Three",
        email: "consumer3@example.com",
        phone: "0723456794",
        password: hashedConsumerPassword,
        role: "CONSUMER",
        location: "Nairobi",
        address: "123 Home St",
      },
    }),
  ]);

  // Create admins
  const admins = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@example.com",
        phone: "0723456795",
        password: hashedAdminPassword,
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "admin1@example.com" },
      update: {},
      create: {
        name: "Admin One",
        email: "admin1@example.com",
        phone: "0723456796",
        password: hashedAdminPassword,
        role: "ADMIN",
        location: "Nairobi",
        address: "789 Admin Blvd",
      },
    }),
  ]);

  // Create products for each farmer
  const products = await Promise.all([
    // Farmer 1 products
    prisma.product.createMany({
      data: [
        {
          name: "Red Apples",
          description: "Fresh red apples from the farm.",
          price: 120.0,
          stock: 50,
          imageUrl: null,
          categoryId: categories[0].id,
          farmerId: farmers[0].id,
        },
        {
          name: "Spinach Bunch",
          description: "Organic spinach, freshly harvested.",
          price: 60.0,
          stock: 100,
          imageUrl: null,
          categoryId: categories[1].id,
          farmerId: farmers[0].id,
        },
        {
          name: "Fresh Milk",
          description: "Freshly collected cow's milk.",
          price: 50.0,
          stock: 200,
          imageUrl: null,
          categoryId: categories[2].id,
          farmerId: farmers[0].id,
        },
      ],
      skipDuplicates: true,
    }),

    // Farmer 2 products
    prisma.product.createMany({
      data: [
        {
          name: "Green Beans",
          description: "Fresh green beans, locally grown.",
          price: 80.0,
          stock: 75,
          imageUrl: null,
          categoryId: categories[1].id,
          farmerId: farmers[1].id,
        },
        {
          name: "Chicken Eggs",
          description: "Fresh free-range chicken eggs.",
          price: 30.0,
          stock: 300,
          imageUrl: null,
          categoryId: categories[2].id,
          farmerId: farmers[1].id,
        },
        {
          name: "Maize Flour",
          description: "High-quality maize flour.",
          price: 120.0,
          stock: 150,
          imageUrl: null,
          categoryId: categories[4].id,
          farmerId: farmers[1].id,
        },
      ],
      skipDuplicates: true,
    }),

    // Farmer 3 products
    prisma.product.createMany({
      data: [
        {
          name: "Mangoes",
          description: "Ripe and juicy mangoes.",
          price: 150.0,
          stock: 40,
          imageUrl: null,
          categoryId: categories[0].id,
          farmerId: farmers[2].id,
        },
        {
          name: "Beef Steak",
          description: "Premium beef cuts.",
          price: 500.0,
          stock: 20,
          imageUrl: null,
          categoryId: categories[3].id,
          farmerId: farmers[2].id,
        },
        {
          name: "Tomatoes",
          description: "Fresh tomatoes, perfect for cooking.",
          price: 40.0,
          stock: 120,
          imageUrl: null,
          categoryId: categories[1].id,
          farmerId: farmers[2].id,
        },
      ],
      skipDuplicates: true,
    }),
  ]);

  // Create orders for each consumer with various statuses
  const orders = await Promise.all([
    // Consumer 1 orders
    prisma.order.create({
      data: {
        userId: consumers[0].id,
        status: "SHIPPED",
        total: 240.0,
        items: {
          create: [
            {
              productId: (
                await prisma.product.findFirst({
                  where: { name: "Red Apples" },
                })
              ).id,
              quantity: 2,
              price: 120.0,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: consumers[0].id,
        status: "DELIVERED",
        total: 160.0,
        items: {
          create: [
            {
              productId: (
                await prisma.product.findFirst({
                  where: { name: "Spinach Bunch" },
                })
              ).id,
              quantity: 2,
              price: 80.0,
            },
          ],
        },
      },
    }),

    // Consumer 2 orders
    prisma.order.create({
      data: {
        userId: consumers[1].id,
        status: "PENDING",
        total: 240.0,
        items: {
          create: [
            {
              productId: (
                await prisma.product.findFirst({
                  where: { name: "Green Beans" },
                })
              ).id,
              quantity: 3,
              price: 80.0,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: consumers[1].id,
        status: "PROCESSING",
        total: 90.0,
        items: {
          create: [
            {
              productId: (
                await prisma.product.findFirst({ where: { name: "Tomatoes" } })
              ).id,
              quantity: 2,
              price: 45.0,
            },
          ],
        },
      },
    }),

    // Consumer 3 orders
    prisma.order.create({
      data: {
        userId: consumers[2].id,
        status: "DELIVERED",
        total: 300.0,
        items: {
          create: [
            {
              productId: (
                await prisma.product.findFirst({
                  where: { name: "Chicken Eggs" },
                })
              ).id,
              quantity: 10,
              price: 30.0,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: consumers[2].id,
        status: "CANCELLED",
        total: 150.0,
        items: {
          create: [
            {
              productId: (
                await prisma.product.findFirst({ where: { name: "Mangoes" } })
              ).id,
              quantity: 1,
              price: 150.0,
            },
          ],
        },
      },
    }),
  ]);

  console.log("\nSeed data created successfully!");
  console.log("\nTest users and their passwords:");
  console.log("\nFarmers:");
  console.log("Farmer One: farmer1@example.com / farmer123");
  console.log("Farmer Two: farmer2@example.com / farmer123");
  console.log("Farmer Three: farmer3@example.com / farmer123");

  console.log("\nConsumers:");
  console.log("Consumer One: consumer1@example.com / consumer123");
  console.log("Consumer Two: consumer2@example.com / consumer123");
  console.log("Consumer Three: consumer3@example.com / consumer123");

  console.log("\nAdmins:");
  console.log("Admin: admin@example.com / admin123");
  console.log("Admin One: admin1@example.com / admin123");

  console.log("\nCategories:");
  console.log("Fruits, Vegetables, Dairy, Meat, Grains");

  console.log("\nProducts:");
  console.log("Farmer One's Products:");
  console.log("- Red Apples (Ksh 120)");
  console.log("- Spinach Bunch (Ksh 60)");
  console.log("- Fresh Milk (Ksh 50)");

  console.log("\nFarmer Two's Products:");
  console.log("- Green Beans (Ksh 80)");
  console.log("- Chicken Eggs (Ksh 30)");
  console.log("- Maize Flour (Ksh 120)");

  console.log("\nFarmer Three's Products:");
  console.log("- Mangoes (Ksh 150)");
  console.log("- Beef Steak (Ksh 500)");
  console.log("- Tomatoes (Ksh 40)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
