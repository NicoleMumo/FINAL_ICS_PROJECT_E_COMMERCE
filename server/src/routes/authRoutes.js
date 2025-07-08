const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const prisma = require('../prisma');
const { verifyAuth } = require('../middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Get user by ID
router.get('/users/:id', verifyAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { id: true, name: true, email: true, address: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user address
router.put('/users/:id/address', verifyAuth, async (req, res) => {
  try {
    const { address } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { address }
    });
    res.json({ message: 'Address updated', address: user.address });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;