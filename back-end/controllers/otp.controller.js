const nodemailer = require('nodemailer');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// In-memory OTP store (not recommended for production)
const otpStore = {};

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ✅ Send OTP to user's email
exports.sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "No user found with this email" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, createdAt: Date.now() };

  try {
    await transporter.sendMail({
      from: `"MRT App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "MRT Password Reset OTP",
      html: `<h3>Your OTP is: <strong>${otp}</strong></h3><p>This OTP will expire in 10 minutes.</p>`,
    });

    res.json({ msg: "OTP sent to your email" });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res.status(500).json({ msg: "Failed to send email" });
  }
};

// ✅ Verify OTP and update password
exports.verifyOtpAndUpdatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ msg: "All fields required" });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ msg: "No OTP requested" });

  const isExpired = Date.now() - record.createdAt > 10 * 60 * 1000;
  if (isExpired) {
    delete otpStore[email];
    return res.status(400).json({ msg: "OTP expired" });
  }

  if (record.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    delete otpStore[email];
    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ msg: "Failed to update password" });
  }
};
