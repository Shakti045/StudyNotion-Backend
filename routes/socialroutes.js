const srouter = require("express").Router();
const passport = require("../controllers/passport");
const User=require('../models/user');
const CLIENT_URL = "https://studynotionv1.netlify.app";
const jwt=require('jsonwebtoken');
require('dotenv').config();

let token;
let user;
srouter.get("/google/login/success", async (req, res) => {
     try{
      const email=req?.user?._json.email; 
      const userfound=await User.findOneAndUpdate({email:email},{lastloggedin:Date.now()}).populate("profile").exec();
      userfound.password=undefined;
      user=userfound;
      if(userfound){ 
      const payload={
        email:userfound.email,
        id:userfound._id,
        role:userfound.role,
        verified:true,
        username:userfound.firstname
    }
     token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"24h"})
   }
     return res.redirect(`${CLIENT_URL}/socialauth`)
     }catch(err){
      console.log(err);
     }
  }
);



srouter.get("/linkedin/login/success", async (req, res) => {
      try{
      const email=req?.user?.emails[0].value; 
      const userfound=await User.findOneAndUpdate({email:email},{lastloggedin:Date.now()}).populate("profile").exec();
      userfound.password=undefined;
      user=userfound;
      if(userfound){ 
      const payload={
        email:userfound.email,
        id:userfound._id,
        role:userfound.role,
        verified:true,
        username:userfound.firstname
    }
     token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"24h"})
   }
     return res.redirect(`${CLIENT_URL}/socialauth`)
     }catch(err){
      console.log(err);
     }
}
);




srouter.get("/login/userdetails",(req,res)=>{
   res.status(200).json({
    token:token,
    user:user
   })
})

srouter.get("/login/failed", (req, res) => {
    res.redirect(CLIENT_URL);
});

srouter.get("/logout", (req, res) => {
  // console.log(req.logOut());
  req.logout();
});

srouter.get("/google", passport.authenticate("google", { scope: ["email"] }));

srouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/login/success",
    failureRedirect: "/login/failed",
  })
);

srouter.get("/github", passport.authenticate("github", { scope: ["email"] }));




srouter.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect:"/auth/google/login/success",
    failureRedirect: "/login/failed",
  })
);



srouter.get("/linkedin", passport.authenticate("linkedin", { scope: ["r_emailaddress,r_liteprofile"] }));

srouter.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/auth/linkedin/login/success",
    failureRedirect: "/login/failed",
  })
);



srouter.get("/dummy",(req,res)=>{
    res.send("Yaa auth routh working")
})

module.exports = srouter;
