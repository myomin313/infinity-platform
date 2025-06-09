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
     

        // try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
              customerEmail: customerEmail,  // Add the user ID here
            }
          });

    // console.log("chargeId",paymentIntent.id);

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


          res.send({ clientSecret: paymentIntent.client_secret });


        // } catch (error) {
        //     let response = internalError();
        //     return res.json(response);
        // }
    
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
 // console.log("service - ",service);
  return Math.round(service.price * quantity * 100); // Stripe uses cents
}

module.exports = router;


// router.post(
//   "/",
//   [
//     body("productId").notEmpty(),
//     body("quantity").isInt({ min: 1 }),
//     body("user.email").isEmail(),
//     body("user.name").notEmpty(),
//     body("shipping.address").notEmpty(),
//     body("shipping.city").notEmpty(),
//     body("shipping.country").notEmpty(),
//     body("payment.token").notEmpty(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ status: "error", errors: errors.array() });
//     }

//     try {
//       const {
//         productId,
//         quantity,
//         user,
//         shipping,
//         payment
//       } = req.body;

     
//       const amount = await calculateTotalAmount(productId, quantity); // Fetch from DB
//       const charge = await stripe.charges.create({
//         amount,
//         currency: "usd",
//         source: payment.token,
//         description: `Order for ${user.email}`
//       });

//       if (!charge.paid) {
//         return res.status(402).json({ status: "error", message: "Payment failed" });
//       }
      
//       const order = new Order({
//         productId,
//         quantity,
//         user,
//         shipping,
//         chargeId: charge.id,
//         status: "Processing",
//         placedAt: new Date()
//       });
//       await order.save();

//       await sendEmail({
//         to: user.email,
//         subject: "Order Confirmation",
//         html: `
//           <h2>Thank you for your purchase!</h2>
//           <p>Order ID: ${order._id}</p>
//           <p>Estimated Delivery: 3-5 business days</p>
//           <p><a href="https://yourstore.com/track/${order._id}">Track Your Order</a></p>
//         `
//       });

//       res.json({
//         status: "success",
//         message: "Payment successful and order placed",
//         orderId: order._id
//       });

//     } catch (error) {
//       console.error("Buy Now Error:", error);
//       res.status(500).json({ status: "error", message: "Server error during purchase" });
//     }
//   }
// );



