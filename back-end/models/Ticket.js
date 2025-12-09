const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  email: { type: String, required: true },  // store user email here
  startPoint: String,
  endPoint: String,
  tripDate: String,
  tripTime: String,
  tripType: String,
  adultCount: Number,
  childCount: Number,
  bookedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ticket", ticketSchema);
