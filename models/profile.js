const mongoose=require('mongoose')
const Profileschema=new mongoose.Schema({
    gender:{
        type:String,
    },
    dob:{
        type:Date,
    },
    about:{
        type:String,
        trim:true
    },
    phonenumber:{
        type:Number,
        trim:true
    }
})

module.exports=mongoose.model("Profile",Profileschema)