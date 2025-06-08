// routes/buyNow.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Or any payment provider
const sendEmail = require("../utils/sendEmail"); // Your custom mailer
const Order = require("../models/orderModel");   // Your Mongoose order schema

// ========== POST /api/buy-now ==========
router.post(
  "/",
  [
    body("productId").notEmpty(),
    body("quantity").isInt({ min: 1 }),
    body("user.email").isEmail(),
    body("user.name").notEmpty(),
    body("shipping.address").notEmpty(),
    body("shipping.city").notEmpty(),
    body("shipping.country").notEmpty(),
    body("payment.token").notEmpty(),
  ],
  async (req, res) => {
    // 1. Validation of User Input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }

    try {
      const {
        productId,
        quantity,
        user,
        shipping,
        payment
      } = req.body;

      // 2. [Optional] Order Summary (handled on frontend)

      // 3. Payment Processing
      const amount = await calculateTotalAmount(productId, quantity); // Fetch from DB
      const charge = await stripe.charges.create({
        amount,
        currency: "usd",
        source: payment.token,
        description: `Order for ${user.email}`
      });

      if (!charge.paid) {
        return res.status(402).json({ status: "error", message: "Payment failed" });
      }

      // 4. Order Fulfillment Trigger
      const order = new Order({
        productId,
        quantity,
        user,
        shipping,
        chargeId: charge.id,
        status: "Processing",
        placedAt: new Date()
      });
      await order.save();

      // 5. Post-Purchase Actions (Email + Redirect)
      await sendEmail({
        to: user.email,
        subject: "Order Confirmation",
        html: `
          <h2>Thank you for your purchase!</h2>
          <p>Order ID: ${order._id}</p>
          <p>Estimated Delivery: 3-5 business days</p>
          <p><a href="https://yourstore.com/track/${order._id}">Track Your Order</a></p>
        `
      });

      res.json({
        status: "success",
        message: "Payment successful and order placed",
        orderId: order._id
      });

    } catch (error) {
      console.error("Buy Now Error:", error);
      res.status(500).json({ status: "error", message: "Server error during purchase" });
    }
  }
);

module.exports = router;
