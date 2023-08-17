const mongoose = require('mongoose')
require('dotenv').config();

const dburl = process.env.MONGO_URL;

module.exports ={dburl,mongoose}