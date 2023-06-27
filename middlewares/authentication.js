const User=require('../models/user')
const jwt=require('jsonwebtoken')
require('dotenv').config();
exports.auth=(req,res,next)=>{
    try{
        const token = req.body.token || req.cookies.token  || req.header("Authorization").replace("Bearer ", "");
        if(!token){
            return res.status(400).json({
                "Success":false,
                "Message":"Unauthorised login"
            })
        }
        const decoded=jwt.decode(token);
        const exppirationtime=decoded.exp;
        const currentTime = Math.floor(Date.now() / 1000)
         if(currentTime>exppirationtime){
            return res.status(404).json({
                Success:false,
                Message:"Session expired kindly relogin"
            })
         }
        const payload=jwt.verify(token,process.env.JWT_SECRET)
        req.user=payload;
        next();
    }catch(err){
        console.log("Error while authenticating the user","=>",err);
        res.status(500).json({
            "Success":false,
            "Message":"Error while authenticating the user"
        })
    }
}

exports.isInstructor=(req,res,next)=>{
    try{
        const role=req.user.role;
        if(role!="Instructor"){
            return res.status(400).json({
                "Success":false,
                "Message":"You are not allowed to instructor activities"
            })
        }
        next();
    }catch(err){
        console.log("Error while checking role","=>",err);
        res.status(500).json({
            "Success":false,
            "Message":"Error while checking role"
        })
    }
}

exports.isadmin=(req,res,next)=>{
    try{
        const role=req.user.role;
        if(role!="Admin"){
            return res.status(400).json({
                "Success":false,
                "Message":"You are not allowed to admin activities"
            })
        }
        next();
    }catch(err){
        console.log("Error while checking role","=>",err);
        res.status(500).json({
            "Success":false,
            "Message":"Error while checking role"
        })
    }
}

exports.isstudent=(req,res,next)=>{
    try{
        const role=req.user.role;
        if(role!="Student"){
            return res.status(400).json({
                "Success":false,
                "Message":"You are not allowed to student activities"
            })
        }
        next();
    }catch(err){
        console.log("Error while checking role","=>",err);
        res.status(500).json({
            "Success":false,
            "Message":"Error while checking role"
        })
    }
}