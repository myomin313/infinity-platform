require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const https = require('https');
const Log = require('./models/logsModel');
const contactController = require("./controllers/contactController");
const productController = require('./controllers/ProductController');
const UserController = require('./controllers/UserController');
const SearchController = require('./controllers/SearchController');
const ServiceController = require('./controllers/ServiceController');
const SecurityController = require('./controllers/SecurityController');
const CasestudyController = require('./controllers/CasestudyController');
const StudycaseController = require('./controllers/StudycaseController');
const AuthController = require('./controllers/AuthController');
const JobController = require('./controllers/JobController');
const ApplicantController = require('./controllers/ApplicantController');
const PaymentController = require('./controllers/paymentController');
const ContactUsController = require('./controllers/ContactUsController');
const CaptchaController = require('./controllers/CaptchaController');
// Initialize Express
const app = express();
const router = express.Router();

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Sample API',
      version: '1.0.0',
      description: 'A simple API that responds with a sample message',
    },
    servers: [
      {
        url: process.env.SWAGGER_URL,
      },
    ],
     components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./controllers/*.js'],

};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Middleware
// const bodyParser = require("body-parser");
//app.use(bodyParser.json());
//app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// start for token and refresh token


// start for token and refresh token
// Database Connection (Updated for Mongoose 6+)
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL;
mongoose.connect(MONGO_URL)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Request Logging Middleware
app.use(async (req, res, next) => {
  const oldSend = res.send;
  res.send = async function(data) {
    res.send = oldSend;
    const response = res.send(data);
    
    try {
      await new Log({
        request: {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body
        },
        response: {
          statusCode: res.statusCode,
          headers: res.getHeaders(),
          body: data
        }
      }).save();
    } catch (err) {
      console.error('Logging Error:', err);
    }
    
    return response;
  };
  next();
});

// Routes

app.use('/', router);
// router.get('/', (req, res) => res.json({ 
//   status: 'OST API Running',
//   dbState: mongoose.connection.readyState 
// }));
app.use('/uploads', express.static('uploads'));
// Import and mount controllers
app.use("/contact", contactController);
app.use("/product", productController);
app.use('/user',UserController);
app.use('/search',SearchController);
app.use('/service',ServiceController);
app.use('/security-services',SecurityController);
app.use('/case-study',CasestudyController);
app.use('/study-case',StudycaseController);
app.use('/auth',AuthController);
app.use('/job',JobController);
app.use('/apply',ApplicantController);
app.use('/payment',PaymentController);
app.use('/contact-us',ContactUsController);
app.use('/captcha',CaptchaController);
// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server Initialization with Port Conflict Handling
const port = 9003;
const server = http.createServer(app); // Simplify unless HTTPS is configured
// const server = process.env.NODE_ENV === 'production' 
//   ? https.createServer(app) 
//   : http.createServer(app);

// Check if port is available before listening
const net = require('net');
const checkPort = (port) => new Promise((resolve) => {
  const tester = net.createServer()
    .once('error', () => resolve(false))
    .once('listening', () => {
      tester.once('close', () => resolve(true)).close();
    })
    .listen(port);
});

const startServer = async () => {
  const isPortAvailable = await checkPort(port);
  if (!isPortAvailable) {
    console.error(`Port ${port} is already in use. Trying alternative port...`);
    const alternativePort = port + 1;
    server.listen(alternativePort, () => {
      console.log(`Server running on port ${alternativePort} (original port ${port} was in use)`);
    });
  } else {
    server.listen(port, () => {
      console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }
};

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});

// Process Handlers
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});