const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, 
  nid: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  hasPass: { type: Boolean, default: false },

  balance: { type: Number, default: 0 },
  rechargeHistory: [
    {
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
