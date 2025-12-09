const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications (randomly ordered)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.aggregate([
      { $sample: { size: 100 } } // Random sample of 100
    ]);
    res.json(notifications);
  } catch (err) {
    console.error("❌ Fetch Notifications Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Public (for testing)
router.post('/', async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ msg: 'Please enter both title and message' });
  }

  try {
    const newNotification = new Notification({ title, message });
    const saved = await newNotification.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Create Notification Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Public (not safe for production)
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error("❌ Delete Notification Error:", err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
