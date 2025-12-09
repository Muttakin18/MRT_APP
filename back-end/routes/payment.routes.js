const express = require("express");
const router = express.Router();
const SSLCommerzPayment = require("sslcommerz-lts");

const store_id = process.env.SSLC_STORE_ID;
const store_passwd = process.env.SSLC_STORE_PASSWD;
const is_live = process.env.IS_LIVE === "true";

router.post("/initiate", async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid amount" });
  }

  const transactionId = "MRT_" + Date.now();

  const data = {
    total_amount: amount,
    currency: "BDT",
    tran_id: transactionId,
    success_url: `http://localhost:3000/api/payment/success?tran_id=${transactionId}`,
    fail_url: `http://localhost:3000/api/payment/fail`,
    cancel_url: `http://localhost:3000/api/payment/cancel`,
    ipn_url: `http://localhost:3000/api/payment/ipn`,
    product_name: "MRT Ticket",
    cus_name: "Test User",
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_phone: "01700000000",
    shipping_method: "NO",
    product_category: "Transport",
    product_profile: "general",
  };

  try {
    const sslcz = new SSLCommerzPayment(
      process.env.SSLC_STORE_ID,
      process.env.SSLC_STORE_PASSWD,
      process.env.IS_LIVE === "true"
    );

    const apiResponse = await sslcz.init(data);
    console.log("SSLCommerz API Response:", apiResponse);

    if (apiResponse.status !== "SUCCESS") {
      return res.status(500).json({ msg: "Payment failed", details: apiResponse });
    }

    res.status(200).json({ redirectUrl: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error("❌ SSLCommerz Init Error:", err);
    res.status(500).json({ msg: "Payment failed" });
  }
});

module.exports = router;
