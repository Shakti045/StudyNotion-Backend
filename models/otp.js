const mongoose=require('mongoose')
const sendemail=require('../utils/mail')
const otpTemplate=require('../utils/emailverificationmail')
const {sendmessage}=require('../utils/sendmessage')
const Otpschema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdat:{
        type:Date,
        required:true,
        default:Date.now(),
        expires:300
    }
})


Otpschema.post("save",async(doc)=>{
  try{
    // await sendemail(doc.email,"OTP FOR VERIFICATION",`${otpTemplate(doc.otp)}`)
    await sendmessage('+917205066581',doc.otp);
  }catch(err){
    console.log("Error while sending mail in otp.js","=>",err)
  }
})

module.exports=mongoose.model("Otp",Otpschema)