const express = require('express')
const bodyParser = require('body-parser')
const app = express();
require('dotenv').config()
const mongoose = require('mongoose')
const {dburl} = require('../config/dbconfig');
const {urlModel} = require('../schema/urlshort')
const {URLgenerate} = require('../urlgenerator/urlgen')


var router = express.Router();



mongoose.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));


router.get('/', async(req, res)=>{
  try {
    const allurl = await urlModel.find().populate('user');
    res.send({statusCode:200, allurl, message:"ALL URLS"});
  } catch (error) {
    res.send({statusCode:500, message:"all url - Internal server Error"})
  }
})

router.post('/create', async(req, res)=> {
  let  shortUrl = URLgenerate();
  let existingUrl = await urlModel.findOne({ shortUrl: shortUrl });

  while (existingUrl) {

      shortUrl = URLgenerate();
      existingUrl = await urlModel.findOne({ shortUrl: shortUrl });

  }

  let urlshort = new urlModel({
      longUrl: req.body.longUrl,
      shortUrl: shortUrl,
  })

  try {
      let data = await urlshort.save();
      res.send({statusCode:200, data, message:"url short data"})
    } catch (err) {
      console.log(err);
      res.send({statusCode:500, message:"Create url - Internal server Error"})
    }

  console.log(req.body.longUrl);
})


router.get('/:urlID', async(req, res) => {
  try {
      const urlshort = await urlModel.findOne({shortUrl: req.params.urlID});
      if (urlshort) {
          await urlModel.findByIdAndUpdate(
              urlshort._id,
              {$inc: {click: 1}}
          );
          res.redirect(urlshort.longUrl);
          res.send({statusCode:200, urlshort, message:"urlshort"})
      } else {
        res.send({statusCode:404, message:"URL ID not Found"})
      }
  } catch (err) {
      console.log(err);
      res.send({statusCode:500, message:"URL ID - Internal server Error"})
  }
});

router.delete('/del/:id', async (req, res) => {
  try {
      const deldata = await urlModel.findByIdAndDelete({ _id: req.params.id });
      res.send({statusCode:200, deldata, message:"url Deleted Successfully"})

  } catch (err) {
      console.log(err);
      res.send({statusCode:500, message:"URL Del - Internal server Error"})
  }
});


module.exports = router;
