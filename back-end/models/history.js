const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },
  tripDate: { type: String, required: true },
  tripTime: { type: String, required: true },
  tripType: { type: String, enum: ['Single', 'Round'], required: true },
  adultCount: { type: Number, default: 1 },
  childCount: { type: Number, default: 0 },
 
  
});

module.exports = mongoose.model('Booking', bookingSchema);
