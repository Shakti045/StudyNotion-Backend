const User=require('../models/user');
const Otp=require('../models/otp');
const otpgenerator=require('otp-generator')
const Profile=require('../models/profile');
const bcrypt=require('bcrypt')
exports.Sendotp=async (req,res)=>{
    try{
      const{firstname,lastname,email,password,role}=req.body;
      if(!firstname || !lastname || !email || !password || !role){
        return res.status(400).json({
            "Success":false,
            "Message":"All fields required"
        })
      }
      const regex=/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
      if(!regex.test(email)){
        return res.status(400).json({
            "Sucess":false,
            "Message":"Invalid mail id"
        })
      }
      const userfound=await User.findOne({email:email})
      if(userfound){
        return res.status(400).json({
            "Success":false,
            "Message":"User already exists kindly login"
        })
      }
      const otp=otpgenerator.generate(6,{
        lowerCaseAlphabets:false,
        upperCaseAlphabets:false,
        specialChars:false
      })
    
      await Otp.create({'email':email,'otp':otp})
   
      return res.status(200).json({
        "Success":true,
        "Message":"Otp sent to your email id"
      })
    }catch(err){
       console.log("Error while sending the otp","=>",err);
       return res.status(500).json({
        "Success":false,
        "Message":"Error while sending otp"
       })
    }
}


exports.Signup=async (req,res)=>{
    try{
        const{firstname,lastname,email,password,role,otp}=req.body;
        if(!otp){
            return res.status(400).json({
                "Success":false,
                "Message":"Please fill the otp"
            })
        }
        const userfound=await User.findOne({email:email})
        if(userfound){
          return res.status(400).json({
              "Success":false,
              "Message":"User already exists kindly login"
          })
        }

        
        const recentotp=await Otp.find({email:email}).sort({createdat:-1}).limit(1);
    
        if(recentotp.length==0 || Date.now()>recentotp[0].createdat+5*60*1000){
            return res.status(400).json({
                "Success":false,
                "Message":"Otp expired please resend the otp"
            })
        }
       if(otp!=recentotp[0].otp){
        return res.status(400).json({
            "Success":false,
            "Message":"Wrong Otp"
        })
       }
       const hashedpassword=await bcrypt.hash(password,10);
       const newprofile=await Profile.create({});
       const user=await User.create({firstname,lastname,email,role,password:hashedpassword,profilephoto:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastname}`,profile:newprofile._id});
  
       res.status(200).json({
        "Success":true,
        "Message":"User created successfully",
        "User":user
       })
    }catch(err){
        console.log("Error while creating the user","=>",err);
        res.status(500).json({
            "Success":false,
            "Message":"Error while creating a user"
        })
    }
}
