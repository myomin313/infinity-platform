const express = require("express");
const router = express.Router();
//const { body, validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Or any payment provider
//const sendEmail = require("../utils/sendEmail"); // Your custom mailer
const Order = require("../models/orderModel"); // Your Mongoose order schema
const serviceModel = require("../models/serviceModel");    
const { checkRequiredFields } = require("../commonFunctions/validate");
const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response");
const authenticateToken = require('../commonFunctions/authenticateToken');

const multer = require('multer');
const upload = multer();


/**
 * @swagger
 * /create-payment-intent:
 *   post:
 *     summary: Create a Stripe payment intent
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - amount
 *               - userId
 *               - quantity
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: "60c72b2f9b1e8a001c8f1234"
 *               amount:
 *                 type: integer
 *                 example: 1000
 *                 description: Amount in smallest currency unit (e.g., cents)
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   example: pi_1GqIC8L4pX3eZc01JfZK29sd_secret_XYZ
 *       400:
 *         description: Missing required fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Server encountered an error while processing the request
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


router.post("/create-payment-intent",authenticateToken, upload.none(), async (req, res) => {
  try {
    console.log("job module", req.body.userId);

    let isRequired = checkRequiredFields(["serviceId","amount", "userId","quantity"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
        const serviceId = req.body.serviceId; 
        const amount = req.body.amount; 
        const userId = req.body.userId;
        const quantity = req.body.quantity;
        const currency  = "eur";
          const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
            payment_method_types: ['card'],
            metadata: {
              userId: userId, // Add the user ID here
            }
          });
           const priceInCents =amount;
           const price = (priceInCents / 100).toFixed(2).replace(/\.00$/, '');
 
           console.log("price",price);
          const order = new Order({
             serviceId,
             userId,
             amount:price,
             chargeId: paymentIntent.id,
             status: "Processing",
             currency,
             quantity,
             placedAt: new Date()
          });
        await order.save();

      console.log("paymentIntent.client_secret",paymentIntent.client_secret);

    return res.send({ clientSecret: paymentIntent.client_secret });

     }
  } catch (err) {
    console.log({ err });
    let response = internalError();
    return res.json(response);
  }
});



router.post("/webhook",async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send('Received');
});

module.exports = router;




