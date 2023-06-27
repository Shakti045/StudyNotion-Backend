const sendemail=require('../utils/mail');
const {contactUsEmail}=require('../utils/contactformresponce')
require('dotenv').config();
exports.contactus=async (req,res)=>{
    try{
     const {firstname,lastname,email,phonenumber,message}=req.body;
     if(!firstname || !lastname || !email || !phonenumber || !message){
        return res.status(400).json({
            Success:false,
            Message:"All fields required"
        })
     }

     await sendemail(email,"Confirmation on contact request",`${contactUsEmail(email,firstname,lastname,message,phonenumber)}`)
     await sendemail(process.env.HELP_DESK_EMAIL,"Someone tried to contact us",`<p>firstname:${firstname}<br><br/>lastname:${lastname}<br><br/>phonenumber:${phonenumber}<br><br/>message:${message}</p>`)

     return res.status(200).json({
        Success:true,
        Message:"Contact request submitted successfully"
     })
    }catch(err){
        console.log("Error while making contact request","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Error while making contact request"
        })
    }
}