require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth.routes");
const ticketRoutes = require("./routes/ticket.routes");
const emailRoutes = require('./routes/email');
const otpRoutes = require('./routes/otp.routes');





const notificationRoutes = require('./routes/notification.routes');
const historyRoutes = require('./routes/history.routes');
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', otpRoutes);




// USE ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use('/api/email', emailRoutes);


app.use("/api/notifications", notificationRoutes);
app.use("/api/history", historyRoutes);

// DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ DB Connection Error", err));
  console.log("Loaded ENV:", {
  SSLC_STORE_ID: process.env.SSLC_STORE_ID,
  SSLC_STORE_PASSWD: process.env.SSLC_STORE_PASSWD,
  IS_LIVE: process.env.IS_LIVE,
});
