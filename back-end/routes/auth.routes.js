const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ REGISTER
router.post('/register', async (req, res) => {
  const { username, email, nid, phone, password, hasPass } = req.body;

  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      const field = existing.username === username ? "Username" : "Email";
      return res.status(400).json({ msg: `${field} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, nid, phone, password: hashedPassword, hasPass });
    await newUser.save();
    res.status(201).json({ msg: 'User registered' });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Incorrect password' });

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        nid: user.nid,
        phone: user.phone,
        hasPass: user.hasPass,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ GET LOGGED-IN USER INFO
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("❌ Token Decode Error:", err);
    res.status(401).json({ msg: 'Invalid token' });
  }
});

// ✅ GET USER (No auth middleware)
router.post('/post', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ UPDATE EMAIL
router.put('/update-email', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailExists) return res.status(400).json({ msg: 'Email already in use' });

    user.email = email;
    await user.save();

    res.json({ msg: 'Email updated successfully' });
  } catch (err) {
    console.error("❌ Email Update Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});
router.put('/update-phone', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ msg: 'Phone is required' });

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Optionally, you could check if phone number already exists for another user

    user.phone = phone;
    await user.save();

    res.json({ msg: 'Phone updated successfully' });
  } catch (err) {
    console.error("❌ Phone Update Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ RECHARGE
router.post('/recharge', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { amount } = req.body;

  if (!authHeader) return res.status(401).json({ msg: 'No token provided' });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.balance += amount;
    user.rechargeHistory.push({ amount });
    await user.save();

    res.json({ msg: 'Recharge successful', newBalance: user.balance });
  } catch (err) {
    console.error("❌ Recharge Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
