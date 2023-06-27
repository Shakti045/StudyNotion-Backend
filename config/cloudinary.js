const cloudinary=require('cloudinary').v2;
require('dotenv').config();
 function connectcloudinary(){
    try{
    cloudinary.config({
        cloud_name:process.env.CLOUD_NAME,
        api_key:process.env.API_KEY,
        api_secret:process.env.API_SECRET
    })
    console.log("connected to cloudinary successfully");
    }catch(err){
        console.error(err);
        console.log("cloudinary connection failed");
    }
}
module.exports=connectcloudinary;