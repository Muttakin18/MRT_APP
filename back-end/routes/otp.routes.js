// routes/otp.routes.js
const express = require('express');
const router = express.Router();
const {
  sendOtpToEmail,
  verifyOtpAndUpdatePassword,
} = require('../controllers/otp.controller');

// Send OTP
router.post('/send-otp', sendOtpToEmail);

// Verify OTP & update password
router.post('/verify-otp', verifyOtpAndUpdatePassword);

module.exports = router;
