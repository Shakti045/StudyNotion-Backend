const User=require('../models/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
require('dotenv').config();
exports.login=async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                "Success":false,
                "Mssage":"All fields required"
            })
        }
        const userfound=await User.findOneAndUpdate({email:email},{lastloggedin:Date.now()}).populate("profile").exec();
        if(!userfound){
            return res.status(400).json({
                "Success":false,
                "Message":"User does not exists kindly signup first"
            })
        }
        const verified=await bcrypt.compare(password,userfound.password)
        if(!verified){
            return res.status(400).json({
              "Success":false,
              "Message":"Incorrect password"
            })
        }
        const payload={
            email:userfound.email,
            id:userfound._id,
            role:userfound.role,
            verified:true,
            password:userfound.password,
            username:userfound.firstname
        }
        const options={
            httpOnly:true,
            expires:new Date(Date.now()+3*24*60*60*60*1000)
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"24h"})
        userfound.password=undefined;
        userfound.token=token;
        res.cookie("token",token,options).status(200).json({
            "Success":true,
            "Message":"Login successfull",
            "User":userfound,
            "token":token
        })
    }catch(err){
        console.log("Error while login","=>",err);
        res.status(500).json({
            "Success":false,
            "Message":"Something went wrong please try again"
        })
    }
}