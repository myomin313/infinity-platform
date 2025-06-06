require('dotenv').config({ path: './.env.local' });
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

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const router = express.Router();
router.get('/', (req, res) => res.json({ 
  status: 'OST API Running',
  dbState: mongoose.connection.readyState 
}));
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
// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server Initialization with Port Conflict Handling
const port = 9003;
//const port = process.env.PORT || 9003;
const server = process.env.NODE_ENV === 'production' 
  ? https.createServer(app) 
  : http.createServer(app);

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