const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { checkRequiredFields } = require("../commonFunctions/validate");
const jobModel = require('../models/jobModel');
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


function generateRequisitionId() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit number
}

/**
 * @swagger
 * /job/create:
 *   post:
 *     summary: Create a new job entry
 *     tags:
 *       - Job
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - workArea
 *               - to_do
 *               - to_bring
 *             properties:
 *               title:
 *                 type: string
 *               workArea:
 *                 type: string
 *               to_do:
 *                 type: string
 *               to_bring:
 *                 type: string
 *               offer:
 *                 type: string
 *               careerStatus:
 *                 type: string
 *               employmentType:
 *                 type: string
 *               expectedTravel:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: your job is successfully created
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     toDo:
 *                       type: string
 *                     toBring:
 *                       type: string
 *                     offer:
 *                       type: string
 *                     requisitionId:
 *                       type: string
 *                     workArea:
 *                       type: string
 *                     careerStatus:
 *                       type: string
 *                     employmentType:
 *                       type: string
 *                     expectedTravel:
 *                       type: string
 *                     location:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error during job creation
 */


router.post("/create", upload.none(), async (req, res) => {
 
  try {
    console.log("job module", req.body);

    let isRequired = checkRequiredFields(["title","workArea", "to_do", "to_bring"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let title = req.body.title;
      let toDo = req.body.to_do;
      let toBring = req.body.to_bring;
      let offer = req.body.offer;
      let requisitionId = generateRequisitionId();
      let workArea = req.body.workArea;
      let careerStatus = req.body.careerStatus;
      let employmentType = req.body.employmentType;
      let expectedTravel = req.body.expectedTravel;
      let location = req.body.location;

        let newJob = new jobModel({
                        title: title,
                        toDo:toDo,
                        toBring:toBring,
                        offer:offer,
                        requisitionId:requisitionId,
                        workArea:workArea,
                        careerStatus:careerStatus,
                        employmentType:employmentType,
                        expectedTravel:expectedTravel,
                        location:location
                      });
      
        let result = await newJob.save(); 
        const response = success("your job  is successfully created", newJob);
       return res.json(response);
    }
  } catch (err) {
    console.log({ err });
    let response = internalError();
    return res.json(response);
  }
});


router.get("/", async (req, res) => {
 try {
     const jobs = await jobModel.find({ isActive: true }); 
    const response = success("your jobs are here", jobs);
    return res.json(response);
  } catch (err) {
   const response = error("error",err)
      return res.json(response);  
  }
});



router.get("/detail/:id", async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await jobModel.findById(jobId);

    if (!job) {
      console.log("hello");
      const response = error("Job not found");
      return res.json(response);
    }
     const response =  success("Job detail retrieved", job);
      return res.json(response);
  } catch (err) {
     const response = error("Job not found");
    return res.json(response);
  }
});





module.exports = router;
