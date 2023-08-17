const mongoose = require('mongoose')

const URLSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'  
    },
    longUrl : {
        type:String,
        required:true
    },
    shortUrl:{
        type:String,
        unique: true,
    },
    click:{
        type:Number,
        default:0
    },
    createdAt:{type:String, default:new Date()}
},
    {timestamps : true}
)

const urlModel = mongoose.model('urlshort', URLSchema)

module.exports= {urlModel}