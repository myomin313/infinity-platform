const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { checkRequiredFields } = require("../commonFunctions/validate");
const userModel = require('../models/userModels');
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

const {
  generateRandomSixDigitNumber,
  generateRandomString,
  createJwtToken,
  verifyJwtToken
} = require("../commonFunctions/microFunctions");

const svgCaptcha = require('svg-captcha');
const multer = require('multer');
const upload = multer();
const nodemailer = require("nodemailer");
const crypto = require('crypto');

function isValidEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
}

let lastCaptchaText = ''; 
let userDB = {};

router.get("/captcha", (req, res) => {
   const captcha = svgCaptcha.create();
     lastCaptchaText = captcha.text; 
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('X-Captcha-Text', captcha.text); 
      res.status(200).send(captcha.data);
});

router.get('/captcha/captcha-text', (req, res) => {
  res.json({ text: lastCaptchaText });
});
// router.post('/verify', (req, res) => {
//   const { userInput } = req.body;
//   if (userInput === lastCaptchaText) {
//     res.send({ success: true });
//   } else {
//     res.send({ success: false });
//   }
// });



const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",        // Outlook SMTP server
  port: 587,                         // TLS port
  secure: false,                     // Use STARTTLS, not SSL
  auth: {
    user: process.env.EMAIL_SENDER,  // Your full Outlook email
    pass: process.env.EMAIL_PASSWORD, // See below for important note
  },
  tls: {
    ciphers: 'SSLv3'
  }
});


const sendResetEmail = async (to, link) => {
  //console.log("user",process.env.sendMail);
    try {
let info = await transporter.sendMail({
  from: `"OST Platform" <${process.env.EMAIL_SENDER}>`,
  to: `${to}`,
  subject: "Welcome to OST Platform - Verify Your Email",
  text: `Please use this to verify your email.`,
  html: `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:6px;">
      <div style="background:#0078ff;color:#fff;padding:20px;text-align:center;border-top-left-radius:6px;border-top-right-radius:6px;">
        <h2 style="margin:0;"> OST Platform</h2>
      </div>
      <div style="padding:30px;">
        <p> OST Platform!</p>
        <p>We're thrilled to have you on board. To get started and ensure your account is secure, please use click the link Below.</p>
        <p style="font-size:16px;"> <span style="color:#0078ff;font-weight:bold;font-size:20px;"><a href="${link}">${link}</a></span></p>
        <p>Welcome aboard, and happy exploring!</p>
        <p style="margin-top:40px;">Best regards,<br/>Team OST</p>
      </div>
    </div>
  `,
});
} catch (err) {
     console.error("Nodemailer:", err);
   
   }

};

const  sendVeificationCode = async (email,code) => {


   //console.log("user",process.env.sendMail);
    try {
let info = await transporter.sendMail({
  from: `"OST Platform" <${process.env.EMAIL_SENDER}>`,
  to: `${email}`,
  subject: "Welcome to OST Platform - Verify Your Email",
  text: `Please use this to verify your email.`,
  html: `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:6px;">
      <div style="background:#0078ff;color:#fff;padding:20px;text-align:center;border-top-left-radius:6px;border-top-right-radius:6px;">
        <h2 style="margin:0;"> OST Platform</h2>
      </div>
      <div style="padding:30px;">
        <p> OST Platform!</p>
        <p>Before you sign in, we need to verify your identity. Enter the following code on the sign-in page.</p>
        <p style="font-size:16px;"> <span style="color:#0078ff;font-weight:bold;font-size:20px;">${code}</span></p>
      
        <p style="margin-top:40px;">Best regards,<br/>Team OST</p>
      </div>
    </div>
  `,
});
} catch (err) {
     console.error("Nodemailer:", err);
   
   }
}



const signToken = id => {
  return jwt.sign({ id },process.env.JWT_SECRET, {
    expiresIn: 300
  });
};
const saltRounds = 10;
const createSendToken = (user,  res) => {
  const token = signToken(user._id);
  
  // Remove password from output
    user.password = undefined;
    user.emailVerification = undefined;
    user.emailVerification = undefined;
  
    const response = success("Login Success",{
       user,
       token:token
     })
     res.json(response);
};

 
function generateVerificationCode(length = 6) {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /user/signup:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: userName
 *         type: string
 *         required: true
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *       - in: formData
 *         name: role
 *         type: string
 *         required: true
 *       - in: formData
 *         name: accountType
 *         type: string
 *         required: true
 *       - in: formData
 *         name: accountLimitation
 *         type: string
 *         required: true
 *       # Add other form fields similarly (startDate, expireDate, enabled, etc.)
 *     responses:
 *       200:
 *         description: User created successfully or error response
 */

/**
 * @swagger
 * /user/update:
 *   put:
 *     tags: [Users]
 *     summary: Update multiple users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     updates:
 *                       type: object
 *     responses:
 *       200:
 *         description: Users updated successfully
 */

/**
 * @swagger
 * /user/delete:
 *   post:
 *     tags: [Users]
 *     summary: Soft delete multiple users
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: formData
 *         name: userIds
 *         type: array
 *         items:
 *           type: string
 *         required: true
 *       - in: formData
 *         name: resigninkey
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Users soft deleted successfully
 */

/**
 * @swagger
 * /user/restore:
 *   post:
 *     tags: [Users]
 *     summary: Restore soft deleted users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               resigninkey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Users restored successfully
 */

/**
 * @swagger
 * /user/block:
 *   post:
 *     tags: [Users]
 *     summary: Block multiple users from logging in
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               resigninkey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Users blocked successfully
 */

/**
 * @swagger
 * /user/suspend-multiple:
 *   post:
 *     tags: [Users]
 *     summary: Suspend multiple users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               resigninkey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Users suspended successfully
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags: [Users]
 *     summary: Login user with email or username and password
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: formData
 *         name: identifier
 *         type: string
 *         description: Email or username
 *         required: true
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Login successful with token
 */

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Request password reset email
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Password reset email sent
 */

/**
 * @swagger
 * /user/reset-password/{token}:
 *   post:
 *     tags: [Users]
 *     summary: Reset password using token
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *         description: New password to set
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /user/:
 *   get:
 *     tags: [Users]
 *     summary: Get list of users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users returned successfully
 */

router.post("/signup",authenticateToken,async (req, res) => {
     console.log("hello",lastCaptchaText);
  try {
    console.log("user module signup", req.body);

    let isRequired = checkRequiredFields(["name","contactNumber", "email", "companyRegistrationNumber",
      "companySize","level","address1","city","country","desiredStartDate","captcha"], req.body);
    
    if (isRequired) {
      console.log("send required fields response",isRequired);
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {

      let name = req.body.name;
      let email = req.body.email;
      let contactNumber = req.body.contactNumber;
      let companyRegistrationNumber = req.body.companyRegistrationNumber;
      let companySize = req.body.companySize;
      let level = req.body.level;
      let address1 = req.body.address1;
      let address2 = req.body.address2;
      let city = req.body.city;
      let country = req.body.country;
      let desiredStartDate = req.body.desiredStartDate;
      let captcha = req.body.captcha;
      let realCaptcha = req.body.realCaptcha;
     
      const isValid = isValidEmail(email);


      

        // const response = error("Email is already exit")
        //   return res.json(response);


        
          if (captcha !== realCaptcha) {
            console.log("Captcha",captcha);
            console.log("lastCaptchaText",realCaptcha);
            console.log("Captcha error");
           // return res.status(400).json({ error: 'Invalid CAPTCHA' });
              const response = error("captcha_error","Captcha is not correct")
              return res.json(response);
          }

      if (isValid) {
        let isEmailExist = await userModel
          .findOne({ email: email })
          .exec();
        console.log({ isEmailExist });
        if (isEmailExist) {
          console.log("conflict email");
         const response = error("email_exit","Email is already exit")
        //  return res.status(400).json({ error: 'Email is already exit' });
          return res.json(response);
        } else {
             console.log("error else");

            const generatePassword = (length = 12) => {
                return crypto.randomBytes(length).toString('base64').slice(0, length);
            };
            const password = generatePassword();
             // console.log("generate",generatePassword()); // e.g., A2k9sPq!uF7X
            // bcrypt.hash(password, saltRounds, async function (err, hash) {
            //   console.log("password validation status", { err, hash });

            //   if (err) {
            //     throw new Error("internal server error");
            //   } else {

             

            const verificationCode = generateVerificationCode();
            const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); 

            // const jwtSignupToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });
               // userDB[email] = { name, email, verificationCode }; // Store code temporarily

                let newUser = new userModel({
                   name: name,
                   email: email,
                   password:password,
                   contactNumber: contactNumber,
                   companyRegistrationNumber:companyRegistrationNumber,
                   companySize:companySize,
                   level:level,
                   address1:address1,
                   address2:address2,
                   city:city,
                   country:country,
                   desiredStartDate:desiredStartDate,
                   verificationCode,
                   verificationCodeExpires
                 });

                let result = await newUser.save();

                  
               await sendVeificationCode(email, verificationCode);

                console.log({ result });
                let { _id } = result;
                console.log("created response", {
                  _id,
                  name,
                  email,
                  verificationCode
                });
                let response = success("new user created", {
                  _id,
                  name,
                  email,
                  verificationCode,
                });
              
                return res.json(response);
             // }
            // });
       
        }
      } else {
        console.log("invalid part called");
        let response = invalidEmail();
        return res.json(response);
      }


    }
  } catch (err) {
    console.log({ err });
    //let response = internalError();
    const response =  error("error")
    return res.json(response);
  }
});

// router.post('/verify-email', (req, res) => {
//   const { verificationEmail, code } = req.body;

//    console.log("token",jwtSignupToken);
//    console.log("code",code);
//   try {
//      const decoded = jwt.verify(jwtSignupToken, process.env.JWT_SECRET);
//      console.log("ggg",decoded.email);
//      const user = userDB[decoded.email];
//       console.log("d code",user);
   

//      console.log("user code",user.code);
//      console.log("code",code);
//     if (!user)  return res.status(400).json({ message: 'User not found' });

//     if (user.code !== code) return res.status(400).json({ message: 'Invalid code' });

//      return res.json({ message: 'Email verified!' });
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// });

router.post('/verify-email',authenticateToken,async (req, res) => {
    console.log("hello verify");
try {
    const  code = req.body.code;
    const  email = req.body.verificationEmail;
    const user = await userModel.findOne({ email });
    console.log("user :",user);
    if (!user) {
         const response = error("Invalid verification code");
      return res.json(response);
    }
    if (user.verificationCode !== code) {
      const response = error("Invalid verification code");
      return res.json(response);
    }
    if (user.verificationCodeExpires < new Date()) {
      const response = error("Verification code expired");
      return res.json(response);
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    const response = success("Email verified successfully");
    return res.json(response);
  } catch (error) {
    const response = error(error.message);
    return res.json(response);
  }
});



// router.put('/:id', async (req, res) => {
//   try {

//      let isRequired = checkRequiredFields(["name","email", "userName", "password","role","accountType","accountLimitation"], req.body);

//     if (isRequired) {
//       console.log("send required fields response");
//       let response = requiredParams(isRequired);
//       return res.json(response);
//     } else {

//     const resigninkey =  req.body.resigninkey; // Expecting: { userIds: ["id1", "id2", "id3"] }
  
//      let issigninValid = verifyJwtToken(resigninkey);

//     if (issigninValid != false) {

//     const userId = req.params.id;
//     // const updates = req.body;
//       let name = req.body.name;
//       let email = req.body.email;
//       let userName = req.body.userName;
//       let accountType = req.body.accountType;
//       let startDate = req.body.startDate;
//       let expireDate = req.body.expireDate;
//       let accountLimitation = req.body.accountLimitation;
//       let role = req.body.role;
//       let enabled = req.body.enabled;
//       let endpoint = req.body.endpoint;
//       let weather = req.body.weather;
//       let map = req.body.map;
//       let analytics = req.body.analytics;
//       let report = req.body.report;
//       let alert = req.body.alert;
//       let allowedUnmanaged = req.body.allowedUnmanaged;
//       let devSecOps = req.body.devSecOps;
//       let devOps = req.body.devOps;
//       let soc = req.body.soc;
//       let sourceCode = req.body.sourceCode;


//       const isValid = isValidEmail(email);

//   if (isValid) {
//       const updateFields = {
//       name,
//       userName,
//       email,
//       accountType,
//       startDate,
//       expireDate,
//       accountLimitation,
//       role,
//       enabled,
//       endpoint,
//       weather,
//       map,
//       analytics,
//       report,
//       alert,
//       allowedUnmanaged,
//       devSecOps,
//       devOps,
//       soc,
//       sourceCode
//     };

//      const updatedUser = await userModel.findByIdAndUpdate(
//        userId,
//        { $set:updateFields},
//        { new: true }
//      );

//      if (!updatedUser) {
//       const response = error("User not found");
//        return res.json(response);
//      }
//      const response = success('User updated successfully',updatedUser)
//       res.json(response);
//     }else{
//        console.log("invalid part called");
//        let response = invalidEmail();
//        return res.json(response);
//      }

//      }else if (issigninValid == false) {
//         console.log("not a valid jwt token");
//         let result = notFound("invalid token provided", "invalid_token");
//         return res.json(result);
//       }

//      }
//   } catch (err) {
//     console.error('Update error:', err);
//     const response = error(err.message );
//     res.json({ message: 'Server error', error: err.message });
//   }
// });

//request body should like  {
//   "users": [
//     {
//       "userId": "123",
//       "updates": {
//         "adminPermissions": "System Admin",
//         "enabled": true
//       }
//     },
//     {
//       "userId": "456",
//       "updates": {
//         "adminPermissions": "Security Admin",
//         "accountLimitation": "Standard"
//       }
//     },
//     {
//       "userId": "789",
//       "updates": {
//         "expirationDate": "2026-12-31",
//         "enabled": false
//       }
//     }
//   ]
// }

router.put('/update',authenticateToken,async (req, res) => {
  // console.log("Hello",req.body);
  const { users }  = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: "Users array is required." });
  }
  try {
    const updateResults = await Promise.all(users.map(async ({ userId, updates }) => {
      if (!userId || !updates) return null;

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
      );
      return updatedUser;
    }));

    const successfulUpdates = updateResults.filter(Boolean);

    const response = success("user(s) updated successfully",successfulUpdates);
    return res.json(response); 
  } catch (err) {
    console.log("errors", err);
    const response = error(err.message)
   return res.json(response);
  }
});


// Soft Delete User
router.post('/delete',authenticateToken,upload.none(), async (req, res) => {
  try {

      let isRequired = checkRequiredFields(["userIds", "resigninkey"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      console.log(response);
      return res.json(response);
    } 

    const  userIds  = req.body.userIds;
    const token =  req.body.resigninkey; // Expecting: { userIds: ["id1", "id2", "id3"] }
    let valid =await verifyJwtToken(token);
    if (valid) {

    if (userIds.length === 0) {
     // console.log("userIds.length",Array.isArray(userIds));
      const  response = error("No user IDs provided");
      return res.json(response);
    }

    const result = await userModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { deleted: true } }
    );
    
    const response = success("Users soft-deleted successfully",result);
      return res.json(response);

      }else if (valid == false) {
        console.log("not a valid jwt token");
        let result = notFound("invalid resigninkey provided", "resigninkey");
        return res.json(result);
      }
  } catch (err) {
    console.error('Soft delete multiple users error:', err);
    const response = internalError(err.message);
    return res.json(response);
  }
});

router.post('/restore',authenticateToken,async (req, res) => {
  try {
    const userIds = req.body.userIds; // Expecting: { userIds: ["id1", "id2", "id3"] }
    const jwtToken =  req.body.resigninkey; // Expecting: { userIds: ["id1", "id2", "id3"] }
   

     const isValid =await verifyJwtToken(jwtToken);

   
    if (isValid) {
   
    if (!Array.isArray(userIds) || userIds.length === 0) {
      const  response = error("No user IDs provided");
      return res.json(response);
    }

    const result = await userModel.updateMany(
      { _id: { $in: userIds }, deleted: true },
      { $set: { deleted: false } }
    );

    const response = success("Users Restore successfully",result);
     return res.json(response);

   }else if (isValid == false) {
        console.log("not a valid jwt token");
        let result = notFound("invalid resigninkey provided", "resigninkey");
        return res.json(result);
    }

  } catch (err) {
     console.error('Restore multiple users error:', err);
    const response = internalError(err.message);
    return res.json(response)
  }
});
// Block multiple users from logging in
router.post('/block',authenticateToken,async (req, res) => {
  try {

     const userIds = req.body.userIds;
     const resigninkey =  req.body.resigninkey; // Expecting: { userIds: ["id1", "id2", "id3"] }
   

     let isValid = await verifyJwtToken(resigninkey);

    if (isValid) {

    if (!Array.isArray(userIds) || userIds.length === 0) {
       const  response = error("No user IDs provided");
      return res.json(response);
    }

    const result = await userModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { enabled: false } }
    );

     const response = success("Users block successfully",result);

    return res.json(response);

  }else if (isValid == false) {
        console.log("not a valid jwt token");
        let result = notFound("invalid resigninkey provided", "resigninkey");
        return res.json(result);
  }

  } catch (err) {

    console.error('Restore multiple users error:', err);
    const response = internalError(err.message);
    return res.json(response)

  }
});

router.post('/suspend-multiple',authenticateToken,async (req, res) => {
  try {
     const userIds = req.body.userIds;
     const resigninkey =  req.body.resigninkey; // Expecting: { userIds: ["id1", "id2", "id3"] }
   

     let isValid =await verifyJwtToken(resigninkey);

    if (isValid) {


    if (!Array.isArray(userIds) || userIds.length === 0) {
       const  response = error("No user IDs provided");
      return res.json(response)
    }

    const result = await userModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { suspended: true } }
    );

   const response = success("Users block successfully",result);
    return res.json(response);

  }else if (isValid == false) {
        console.log("not a valid jwt token");
        let result = notFound("invalid resigninkey provided", "invalid_token");
        return res.json(result);
  }

  } catch (err) {
    console.error('Restore multiple users error:', err);
    const response = internalError(err.message);
    return res.json(response)
   }
});


router.post("/login",upload.none(), async (req, res) => {
     //try {
    const { identifier, password } = req.body;
    console.log("req.body.",req.body.password);

    if (!identifier || !password) {
      const response = error("Please provide identifier and password")
      return res.json(response);
    }

    // 2) Check if user exists and password is correct
    const user = await userModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).select('+password');
      if (!user) {
        let response = error("incorrect credentials");
        return res.json(response);
    }
    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        let response = error("incorrect password, try again");
        return res.json(response);
    }
    console.log("user",user);
    createSendToken(user, res);
 
});

router.post('/forgot-password',authenticateToken,upload.none(), async (req, res) => {
      console.log("req.body ",req.body);
  try {
    let isRequired = checkRequiredFields(["email"], req.body); 
 
    if (isRequired) {
        console.log("send required fields response");
        let response = requiredParams(isRequired);
     
        return res.json(response);
    }
    // const {email} = req.body;
    const email= req.body.email;
    const user = await userModel.findOne({ email });
    if (!user){
       const response = error("User not found");
       return res.json(response);
    } 

      // 2. Generate reset token (valid for 1 hour)
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();


    const resetLink = `${process.env.APP_URL}/reset-password/${token}`;
    await sendResetEmail(user.email, resetLink);
    const response = success("Password reset email sent successfully",user.email);
    return res.json(response);

  } catch (err) {
    console.error(err);
    const response = error(err.message);
    return res.json(response);
  }
});


router.post('/reset-password/:token',authenticateToken,upload.none(), async (req, res) => {
  
  const { token } = req.params;
  try {
     let isRequired = checkRequiredFields(["password"], req.body); 
  if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
  }else{
    // 1. Find user by token and check expiration
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
       const response = error("Invalid or expired token");
       return res.json(response);
    }
    const password = req.body.password;
    const hash = await bcrypt.hash(password, saltRounds);

    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    const response = success("Password reset successfully")
      res.json(response);
    }
  } catch (err) {
    console.error(err);
    const response=error(err.message);
    res.json(response);
  }
});
router.get("/",authenticateToken,async (req, res) => {
  try {
    const user = await userModel.find({}, { password: 0 }).sort({ createdAt: -1 });
    console.log("user",user);
    const response = success("users  list", user);
    return res.json(response);
  } catch (err) {
    const response = error(err);
    return  res.json(response);
  }
});


module.exports = router;
