const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Connect to MongoDB using the connection string
mongoose.connect('mongodb+srv://danial:779hRsy0RVMRRRlP@gulag0.ij0pzbn.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema for the Admin model
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  // Add other properties as needed
});

const Admin = mongoose.model('Admin', adminSchema);

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register a new admin account
 *     description: Register a new admin with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully registered
 *       '400':
 *         description: Bad request
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newAdmin = new Admin({ username, password });
    await newAdmin.save(); // Save admin data to the database
    res.status(200).json({ message: 'Admin registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
