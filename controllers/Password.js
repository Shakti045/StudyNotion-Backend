const User=require('../models/user')
const sendemail=require('../utils/mail')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt');
const crypto=require('crypto')
const {passwordUpdated}=require('../utils/passwordupdatemail')
require('dotenv').config();
exports.changepassword=async (req,res)=>{
    try{
        const token=req.body.token || req.cookies.token || req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(400).json({
                "Success":false,
                "Message":"Sorry your session has expired kindly relogin and changepassword"
            })
        }
        const {password,newpassword}=req.body
        if(!newpassword || !password){
            return res.status(400).json({
                "Suceess":false,
                "Message":"Please enter both old and new password"
            })
        }
        if(newpassword==password){
            return res.status(400).json({
                "Success":false,
                "Message":"Your newpassword and currentpassword should be different"
            })
        }
        const payload=jwt.verify(token,process.env.JWT_SECRET)
        const email=payload.email;
        const userpassword=payload.password;
        if(!await bcrypt.compare(password,userpassword)){
            return res.status(400).json({
                "Success":false,
                "Message":"Kindly enter your current password correctly"
            })
        }
        const hashedpassword=await bcrypt.hash(newpassword,10);
        const updateduser=await User.findOneAndUpdate({email:email},{password:hashedpassword},{new:true})
        await sendemail(email,"StudyNotion Alert",`${passwordUpdated(email,updateduser.firstname)}`)
       return res.status(200).json({
        "Success":true,
        "Message":"Password updated successfully"
       })
    }catch(err){
     console.log("Error while changing the password","=>",err);
     return res.status(500).json({
        "Success":false,
        "Message":"Something went wrong "
     })
    }
}




exports.resetpasswordtokengeneration=async (req,res)=>{
   try{
    const{email}=req.body;
    const userfound=await User.findOne({email:email})
    if(!userfound){
        return res.status(400).json({
            "Success":false,
            "Message":"Kindly enter registered mail id"
        })
    }

   const token=crypto.randomUUID();
   await User.findOneAndUpdate({email:email},{resetpasswordtoken:token,tokenecreated:Date.now()})
   await sendemail(email,"Password updation request",`https://studynotionv1.netlify.app/resetpassword/${token}`);
   res.status(200).json({
    "Success":true,
    "Message":"A link for password reset has been sent to your mail id"
   })
   }catch(err){
    console.log("Error while generating token for password reset","=>",err);
    res.status(500).json({
        "Success":false,
        "Message":"Error while generating token for password reset"
    })
   }
}


exports.resetpasswod=async (req,res)=>{
   try{
    const {token,newassword}=req.body
    if(!token){
        return res.status(400).json({
            "Success":false,
            "Message":"Invalid request,token missing"
        })
    }
    
    const user=await User.findOne({resetpasswordtoken:token})
    if(!user){
        return res.status(400).json({
            "Success":true,
            "Message":"Bad request"
        })
    }
    if(Date.now()>user.tokenecreated + 5*50*1000){
        return res.status(400).json({
            "Success":false,
            "Message":"Token expired kindly retry"
        })
    }
    const hashedPassword=await bcrypt.hash(newassword,10);
    await User.findByIdAndUpdate({_id:user._id},{password:hashedPassword})
    res.status(200).json({
        "Success":true,
        "Message":"Your password changed succesfully"
    })
   }catch(err){
    console.log("Error while resetting the password","=>",err);
    res.status(500).json({
        "Success":false,
        "Message":"Error while resetting the password"
    })
   }
}
