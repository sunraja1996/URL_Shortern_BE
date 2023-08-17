var express = require('express');
var router = express.Router();

var express = require('express');
const {mongoose} = require('mongoose');
const {dburl} = require('../config/dbconfig');
const {userModel} = require ('../schema/userSchema.js');
const {urlModel} = require('../schema/urlshort')
const {URLgenerate} = require('../urlgenerator/urlgen')
const {hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin} = require('../config/auth')

var router = express.Router();

mongoose.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));



router.get('/allusers',validate,roleAdmin, async(req, res)=>{
  try {
   let users = await userModel.find().populate('url');
   res.send({statusCode:200, users, message:"All DATA fetched Successfull"})

  } catch (error) {
    console.log('error');
    res.send({statusCode:500, message:"Internal server Error"})
  }
}) 


router.get('/userprofile', validate, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return res.send({ statusCode: 400, message: "User not found" });
    }

    const userUrls = await urlModel.find({ user: user._id });

    res.send({
      statusCode: 200,
      message: "Profile fetched Successfully",
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        imageUrl: user.imageUrl,
        urls: userUrls,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({ statusCode: 500, message: "Internal server Error" });
  }
});



router.post('/userprofile/createshorturl', validate, async (req, res) => {
  try {

    if (!req.user || !req.user.email) {
      return res.status(401).send({ statusCode: 401, message: "User not authenticated" });
    }

    const user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(400).send({ statusCode: 400, message: "User not found" });
    }

    const shortUrl =  `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}-${URLgenerate()}`;
    let existingUrl = await urlModel.findOne({ shortUrl });

    while (existingUrl) {
      existingUrl = await urlModel.findOne({ shortUrl: URLgenerate() });
    }

    const urlshort = new urlModel({
      user: user._id,
      longUrl: req.body.longUrl,
      shortUrl: shortUrl,
    });

    const savedUrl = await urlshort.save();

    res.send({ statusCode: 200, message: "Short URL created successfully", url: savedUrl });
  } catch (error) {
    console.log(error);
    res.send({ statusCode: 500, message: "Internal server error" });
  }
});



router.post('/signup', async(req, res)=>{
  try {
    let usersignup = await userModel.findOne({email:req.body.email})
    if(!usersignup){
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword;
      let newUser = await userModel.create(req.body)
      res.send({
        statusCode:200,
        message:"User Signedup Successfully"
      })
    }
    else res.send({statusCode:400,newUser, message:"User Already Exists"})
   
  } catch (error) {
    console.log('error');
    res.send({statusCode:500, message:"Internal server Error"})
  }
})

router.post('/login', async(req, res)=>{
  try {
    let loginuser = await userModel.findOne({email:req.body.email})
    if( loginuser ){
      if(await hashCompare(req.body.password, loginuser.password) === true){
        let token = await createToken(loginuser)
        const { role } = loginuser;
        res.send({statusCode:200, token,role, message:"Login Successfull"})
      } else 
      res.send({statusCode:400, message:"Invalid Credential"})
    }
    else
        res.send({statusCode:400, message:"User doesn't Exists"})
   
  } catch (error) { 
    console.log('error');
    res.send({statusCode:500, message:"Internal server Error"})
  }
})


router.delete('/deleteuser/:email', validate, roleAdmin, async (req, res) => {
  try {
    const deletedUser = await userModel.findOneAndDelete({ email: req.params.email });

    if (!deletedUser) {
      res.send({statusCode:400, message:"User doesn't Exists"})
    } else
    res.send({statusCode:200, user: deletedUser, message: "User deleted successfully"})

  } catch (error) {
    console.log('error');
    res.send({statusCode:500, message:"Internal server Error"})
  }
});



module.exports = router;
