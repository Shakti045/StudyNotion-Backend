const Profile=require('../models/profile');
const User=require('../models/user');
const Courseprogress=require('../models/courseprogress');
const  mongoose  = require('mongoose');
const Course=require('../models/course');
exports.updateprofile=async (req,res)=>{
    try{
       
        const {gender,dob,about,phonenumber}=req.body;
        if(!gender && !dob && !about && !phonenumber){
            return res.status(400).json({
                "Success":false,
                "Message":"Kindly provide atleast one field to update profile"
            })
        }
  
        const uid=req.user.id;
        const user=await User.findOne({_id:uid});
        const profileid=user.profile;
        const updatedprofile=await Profile.findByIdAndUpdate({_id:profileid},{gender:gender,dob:dob,about:about,phonenumber:phonenumber},{new:true});
        res.status(200).json({
            "Success":true,
            "Message":"Profile updated successfully",
            "profile":updatedprofile
        })
    }catch(err){
        console.log("Error while updating profile","=>",err);
        res.status(500).json({
            "Success":false,
            "Message":"Profile updation failed due to some internal error"
        })
    }
}

exports.getprofile=async(req,res)=>{
    try{
       const id=req.user.id;
       const profile=await User.findById(id).populate({
        path:"profile"
       });
       return res.status(200).json({
        Success:true,
        Message:"Profile fetched successfully",
        Profile:profile
       })
    }catch(err){
        console.log("Error while frtching profile details");
        return res.status(500).json({
            Success:false,
            Message:"Internal error while fetching profile dtails"
        })
    }
}

async function getprogressofcourse(courseid,userid){
    try{
      const progresscount=await Courseprogress.findOne({user:userid,course:courseid});
      if(!progresscount){
        return 0;
      }
      return progresscount?.completedvideos.length;
    }catch(err){

    }
}

function gettotalvideo(sections){
    let k=0;
    for(const section of sections){
        k=k+section.subsections.length
    }
    return k;
}
exports.getregisteredcourses=async(req,res)=>{
    try{
        const {id}=req.user;
        const courses=await User.findById(id).populate({
            path:"coursesenrolled",
            populate:{
                path:"sections"
            }
                });
        const progressarray=[];        
        for(const course of courses.coursesenrolled){
            const progresscount=await getprogressofcourse(course._id,id);
            const totalvideo= gettotalvideo(course.sections);
            let progress=0;
            if(totalvideo!==0){
              progress=(progresscount/totalvideo)*100;
            }
            progressarray.push(progress)
        }
        // console.log(progressarray);
        return res.status(200).json({
            Success:true,
            Message:"courses fetched successfully",
            courses:courses.coursesenrolled,
            progress:progressarray
        })
    }catch(err){
        console.log("Error while getting registered courses","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Something error occured while getting registered courses"
        })
    }
}


exports.getinstructordashboarddata=async(req,res)=>{
    try{
   
       const {id}=req.user;
       if(!id){
        return res.status(404).json({
            Success:false,
            Message:"Invalid Request"
        })
       }
       const courses=await Course.find({instructor:id});
       const data=[];
       courses.forEach((course)=>{
          const totalstudent=course.studentsenrolled.length;
          const profit=course.price*totalstudent;
          data.push({
            totalstudent:totalstudent,
            profit:profit,
            thumbnail:course.thumbnail,
            title:course.title,
            price:course.price
          })
       })
       return res.status(200).json({
        Success:true,
        Message:"Data fetched successfully",
        data
       })
    }catch(err){
        console.log("Error while getting data for instructor dashboaard","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Error while getting data for instructor dashboaard"
        })
    }
}