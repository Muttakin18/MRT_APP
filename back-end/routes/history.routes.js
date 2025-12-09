const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Booking = require('../models/history');  // your booking mongoose model

// Auth Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ msg: 'Invalid token' });
  }
};

// GET /api/history - get bookings for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ userId }).sort({ tripDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch history', error: err.message });
  }
});

// POST /api/history/book - add new booking for logged-in user
router.post('/book', auth, async (req, res) => {
  try {
    const { startPoint, endPoint, tripDate, tripTime, tripType, adultCount, childCount } = req.body;

    // Create new booking document
    const booking = new Booking({
      userId: req.user.userId,
      startPoint,
      endPoint,
      tripDate,
      tripTime,
      tripType,
      adultCount,
      childCount
    });

    await booking.save();
    res.status(201).json({ msg: "Booking saved", booking });
  } catch (err) {
    res.status(500).json({ msg: "Failed to book", error: err.message });
  }
});

module.exports = router;
