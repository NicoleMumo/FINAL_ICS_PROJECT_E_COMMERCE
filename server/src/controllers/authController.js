const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    console.log('Got registration request', req.body);
    let { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
      console.log("Missing fields");
      return res.status(400).json({ message: "All fields are required." });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(409).json({ message: "Email already in use." });
    }
    // Sanitize and validate role
    const allowedRoles = ["FARMER", "CONSUMER", "ADMIN"];
    let sanitizedRole = (role || "CONSUMER").toString().trim().toUpperCase();
    console.log('Sanitized role:', sanitizedRole);
    const userRole = allowedRoles.includes(sanitizedRole) ? sanitizedRole : "CONSUMER";
    // Insert user
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Inserting user...');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: userRole
      },
    });
    console.log('Inserted user:', user);
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Registration failed." });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Missing fields");
      return res.status(400).json({ message: "All fields are required." });
    }
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (!user || !user.password) {
      console.log("User not found or no password:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }
    console.log("Login successful for:", email);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed." });
  }
}; 