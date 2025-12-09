// routes/ticket.routes.js
const express = require('express');
const router  = express.Router();
const QRCode  = require('qrcode');
const nodemailer = require('nodemailer');
const Ticket  = require('../models/Ticket');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';  
// e.g. set BASE_URL=https://yourdomain.com in .env

// POST /api/tickets/book
router.post('/book', async (req, res) => {
  try {
    const {
      email, startPoint, endPoint,
      tripDate, tripTime, tripType,
      adultCount, childCount
    } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required" });

    // 1) save ticket
    const newTicket = new Ticket({ email, startPoint, endPoint, tripDate, tripTime, tripType, adultCount, childCount });
    await newTicket.save();

    // 2) build URL for summary page
    const summaryUrl = `${BASE_URL}/front-end/summary.html?ticketId=${newTicket._id}`;

    // 3) generate QR from URL
    const qrBuffer = await QRCode.toBuffer(summaryUrl);

    // 4) setup mailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
    });

    // 5) mail options: embed QR as CID attachment
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your MRT Ticket Confirmation',
      html: `
        <h2>Hello!</h2>
        <p>Your MRT trip is booked. Scan the QR code below to view your trip summary:</p>
        <img src="cid:qrcodeimage" alt="QR Code" width="200" height="200"/>
      `,
      attachments: [{
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcodeimage'
      }]
    };

    // 6) send mail
    await transporter.sendMail(mailOptions);

    res.status(201).json({ msg: "Ticket booked & email sent!", ticket: newTicket });
  }
  catch (err) {
    console.error("Ticket booking error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



// GET /api/tickets/count
router.get('/count', async (req, res) => {
  try {
    const userId = req.user.id; // Requires auth middleware to populate req.user
    const totalTrips = await Ticket.countDocuments({ user: userId });
    res.json({ totalTrips });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});



module.exports = router;
