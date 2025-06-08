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

function isValidEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
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
router.post("/signup", upload.none(), async (req, res) => {
 
  try {
    console.log("user module signup", req.body);

    let isRequired = checkRequiredFields(["name","email", "userName", "password","role","accountType","accountLimitation"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let name = req.body.name;
      let userEmail = req.body.email;
      let userName = req.body.userName;
      let password = req.body.password;
      let accountType = req.body.accountType;
      let startDate = req.body.startDate;
      let expireDate = req.body.expireDate;
      let accountLimitation = req.body.accountLimitation;
      let role = req.body.role;
      let enabled = req.body.enabled;
      let endpoint = req.body.endpoint;
      let weather = req.body.weather;
      let map = req.body.map;
      let analytics = req.body.analytics;
      let report = req.body.report;
      let alert = req.body.alert;
      let allowedUnmanaged = req.body.allowedUnmanaged;
      let devSecOps = req.body.devSecOps;
      let devOps = req.body.devOps;
      let soc = req.body.soc;
      let sourceCode = req.body.sourceCode;
      const isValid = isValidEmail(userEmail);

      if (isValid) {
        let isEmailExist = await userModel
          .findOne({ email: userEmail })
          .exec();
        console.log({ isEmailExist });
        let isUsernameExist = await userModel
          .findOne({ userName: userName })
          .exec();
       // console.log(isUsernameExist);

        if (isEmailExist) {
          console.log("conflict email");
          //let response = conflict("email already exit");

          const response = error("Email is already exit")
          return res.json(response);
        } else if (isUsernameExist) {
          // console.log("conflict userName");
          // let response = conflict("userName already exit");
          // return res.json(response);


           const response = error("userName is already exit")
          return res.json(response);
        } else {
          
            bcrypt.hash(password, saltRounds, async function (err, hash) {
              console.log("password validation status", { err, hash });

              if (err) {
                throw new Error("internal server error");
              } else {
                let newUser = new userModel({
                   name: name,
                   userName: userName,
                   email: userEmail,
                   password: hash,
                   accountType:accountType,
                   startDate:startDate,
                   expireDate:expireDate,
                   accountType:accountType,
                   accountLimitation:accountLimitation,
                   role:role,
                   enabled:enabled,
                   endpoint:endpoint,
                   weather:weather,
                   map:map,
                   analytics:analytics,
                   report:report,
                   alert:alert,
                   allowedUnmanaged:allowedUnmanaged,
                   devSecOps:devSecOps,
                   devOps:devOps,
                   soc:soc,
                   sourceCode:sourceCode
                 });

                let result = await newUser.save();
                console.log({ result });
                let { _id } = result;
                console.log("created response", {
                  _id,
                  name,
                  userName,
                  userEmail
                });
                let response = success("new user created", {
                  _id,
                  name,
                  userName,
                  userEmail,
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
    //let response = internalError();
    const response =  error("error")
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
    createSendToken(user, res);
 
});


router.get("/", async (req, res) => {
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
