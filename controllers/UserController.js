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
} = require("../commonFunctions/response")

const multer = require('multer');
const upload = multer();


const JWT_SECRET = "ostmyo@9DjR5pZwQ2mS7kP4"

function isValidEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
}

const signToken = id => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: 300
  });
};
const saltRounds = 10;
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  user.emailVerification = undefined;
  user.emailVerification = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

router.post("/signup", upload.none(), async (req, res) => {
 
  try {
    console.log("user module signup", req.body);

    let isRequired = checkRequiredFields(["name","email", "userName", "password"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let fullname = req.body.name;
      let userEmail = req.body.email;
      let userName = req.body.userName.toLowerCase();
      let password = req.body.password;
      const isValid = isValidEmail(userEmail);

      if (isValid) {
        let isEmailExist = await userModel
          .findOne({ email: userEmail, emailVerification: true })
          .exec();
        console.log({ isEmailExist });
        let isUsernameExist = await userModel
          .findOne({ userName: userName, emailVerification: true })
          .exec();
        console.log(isUsernameExist);

        if (isEmailExist) {
          console.log("conflict email");
          let response = conflict("email already exit");
          return res.json(response);
        } else if (isUsernameExist) {
          console.log("conflict userName");
          let response = conflict("userName already exit");
          return res.json(response);
        } else {
          console.log("create new user,send otp on email and store it in user object");
         // let signup_otp = generateRandomSixDigitNumber();
         // console.log({ signup_otp });
         // sendEmailNotification(userEmail, userName, signup_otp, "signup");
        
            console.log("email is not exist,create new user");

            bcrypt.hash(password, saltRounds, async function (err, hash) {
              console.log("password validation status", { err, hash });

              if (err) {
                throw new Error("internal server error");
              } else {
                let newUser = new userModel({
                  name: fullname,
                  userName: userName,
                  email: userEmail,
                  password: hash,
                });

                let result = await newUser.save();
                console.log({ result });
                let { _id } = result;
                console.log("created,response", {
                  _id,
                  fullname,
                  userName,
                  userEmail
                });
                let response = success("new user created", {
                  _id,
                  fullname,
                  userName,
                  userEmail,
                  role: "user"
                });
                return res.json(response);
              }
            });
       
        }
      } else {
        console.log("invalid part called");
        let response = invalidEmail();
        return res.json(response);
      }
    }
  } catch (err) {
    console.log({ err });
    let response = internalError();
    return res.json(response);
  }
});


router.post("/login", upload.none(), async (req, res) => {
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
        let response = error("incorrect password, try again", "incorrect_key");
        return res.json(response);
    }
    console.log("user",user);
    createSendToken(user, 200, res);
 
});


module.exports = router;
