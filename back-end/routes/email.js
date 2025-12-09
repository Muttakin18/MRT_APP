const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// ✅ Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ✅ Route to handle sending summary emails
router.post('/send-summary', async (req, res) => {
  const { to, subject, summaryText } = req.body;

  if (!to || !subject || !summaryText) {
    return res.status(400).json({ msg: "Missing email details" });
  }

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: summaryText,
    });

    res.json({ msg: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res.status(500).json({ msg: "Failed to send email" });
  }
});

module.exports = router;
