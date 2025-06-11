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

const multer = require('multer');
const upload = multer();


/**
 * @swagger
 * /payment/create-payment-intent:
 *   post:
 *     summary: Create a Stripe payment intent and save order details
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - quantity
 *               - customerEmail
 *               - customerName
 *               - address
 *               - city
 *               - country
 *             properties:
 *               serviceId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               customerEmail:
 *                 type: string
 *                 format: email
 *               customerName:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
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
 *                   description: Stripe client secret for frontend usage
 *       400:
 *         description: Required fields missing or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error during payment processing
 */


router.post("/create-payment-intent", upload.none(), async (req, res) => {
  try {
    console.log("job module", req.body);

    let isRequired = checkRequiredFields(["serviceId","quantity", "customerEmail", "customerName","address","city","country"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
    
      let serviceId = req.body.serviceId;
      let quantity = req.body.quantity;
      let customerEmail = req.body.customerEmail;
      let customerName = req.body.customerName;
      //let token = req.body.token;
      let address = req.body.address;
      let city = req.body.city;
      let country = req.body.country;
     

      // 3. Payment Processing
      const amount = await calculateTotalAmount(serviceId, quantity); // Fetch from DB

      console.log("amount",amount);
     

       
          const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
              customerEmail: customerEmail,  // Add the user ID here
            }
          });
      const order = new Order({
        serviceId,
        quantity,
        customerName,
        customerEmail,
        address,
        city,
        country,
        amount,
        chargeId: paymentIntent.id,
        status: "Processing",
        placedAt: new Date()
      });
      await order.save();

    return res.send({ clientSecret: paymentIntent.client_secret });

    }
  } catch (err) {
    console.log({ err });
    let response = internalError();
    return res.json(response);
  }
});



router.post("/webhook", async (req, res) => {
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


async function calculateTotalAmount(serviceId, quantity) {
  const service = await serviceModel.findById(serviceId);

  return Math.round(service.price * quantity * 100); // Stripe uses cents
}

module.exports = router;




