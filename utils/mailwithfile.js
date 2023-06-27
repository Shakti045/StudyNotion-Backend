const nodemailer=require('nodemailer');
require('dotenv').config();
const transporter=nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS
    }
})

async function sendemailwithfile(receiver,subject,message,filename,path){
    try{ 
        await  transporter.sendMail({
         from:"StudyNotion the digital learning platform",
         to:`${receiver}`,
         subject:`${subject}`,
         html:`${message}`,
         attachments:[{
            filename:filename,
            path:path,
            contentType:'application/pdf'
         }]
         
     })
 
    }catch(err){
     console.log("Error while sending mail in utils","=>",err);
    }
 }

module.exports=sendemailwithfile;
