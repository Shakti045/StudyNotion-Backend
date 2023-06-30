const User=require('../models/user')
const uploadmedia=require('../utils/file')
const jwt=require('jsonwebtoken')
require('dotenv').config();
exports.profilephotoupdate=async(req,res)=>{
    try{
        const token= req.body.token || req.cookies.token ||  req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(400).json({
                "Message":"Unauthorised access to upload photo",
                "Success":false
            })
        }
      const id=jwt.verify(token,process.env.JWT_SECRET).id;
      const file=req.files.file;
      const filetype=file.name.split(".")[-1];
      const supportedfiletype=["png","jpg","svg","jpeg","gif","webp"]
      if(!supportedfiletype.includes(filetype)){
        return res.status(400).json({
            "Success":false,
            "Message":"Invalid file type"
        })
      }
      const uploadedfile=await uploadmedia(file);
      await User.findByIdAndUpdate({_id:id},{profilephoto:uploadedfile.secure_url})
      return res.status(200).json({
        "Success":true,
        "Message":"File uploaded to cloudinary successsfully",
        "url":uploadedfile.secure_url
      })
    }catch(err){
       console.log("Error while uploading file in cloudinary","=>",err)
       return res.status(500).json({
        "Success":false,
        "Message":"Error while uploading file in cloudinary"
       })
    }
}
