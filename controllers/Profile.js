const Profile=require('../models/profile');
const User=require('../models/user');
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


exports.getregisteredcourses=async(req,res)=>{
    try{
        const {id}=req.user;
        const courses=await User.findById(id).populate("coursesenrolled");
        return res.status(200).json({
            Success:true,
            Message:"courses fetched successfully",
            courses:courses.coursesenrolled

        })
    }catch(err){
        console.log("Error while getting registered courses","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Something error occured while getting registered courses"
        })
    }
}