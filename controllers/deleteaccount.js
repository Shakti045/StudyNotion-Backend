const User=require('../models/user')
const cron=require('node-cron')
const Profile=require('../models/profile');
const Course = require('../models/course');
const sendemail=require('../utils/mail')
const job=require('node-schedule')
 async function deleteaccountrequest(id,email){
    try{
        const scheduledDate=new Date(Date.now()+ 5*24*60*60*1000);
        const cronExpression = `${scheduledDate.getSeconds()} ${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;
         cron.schedule(cronExpression,async()=>{
          const user=await User.findById({_id:id})
          if(user.lastloggedin<=Date.now()-5*24*60*60*1000){
            await Profile.findByIdAndDelete({_id:user.profile});
            const coursesenrolled=user.coursesenrolled;
            await Course.updateMany({_id:{$in:coursesenrolled}},{$pull:{studentsenrolled:id}})
            await User.deleteOne({_id:id});
          }
        })
    }catch(err){
        console.log("Error while deleting account","=>",err);
        await sendemail(email,"Account deletion request",`<p>Sorry for inconveniece,Your account deletion request failed,Kindly reach out near us through the given mail id</p>`)
    }
}

exports.deleteaccount=async (req,res)=>{
    try{
     const id=req.user.id;
     const email=req.user.email;
     deleteaccountrequest(id,email);
     await sendemail(email,"Account deletion request",`<p>Your account is scheduled to be deleted on ${new Date(Date.now()+5*24*60*60*1000)},if you feel to get back to your account you can login to your account within 5 days</p>`);
     res.status(200).json({
        Success:true,
        Message:"Account deletion request submirtted"
     })
    }catch(err){
     return res.status(500).json({
        Success:true,
        Message:"Deletion request failed"
     })
    }
}



//  function jobschedule(id){
//   job.scheduleJob(new Date(Date.now()+5*24*60*60*1000),async()=>{

//   })
//  }

