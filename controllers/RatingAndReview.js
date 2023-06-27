const Ratings=require('../models/rating')
const Course=require('../models/course');
const  mongoose  = require('mongoose');

exports.createrating=async(req,res)=>{
    try{
     let {rating,review,courseid}=req.body;
     const userid=req.user.id
     if(!rating || !review || !courseid || !userid){
        return res.status(400).json({
            Success:false,
            Message:"All fields required"
        })
     }
     courseid=new mongoose.Types.ObjectId(courseid);
     const course=await Course.findOne({_id:courseid})
     if(course.studentsenrolled.indexOf(userid)===-1){
        return res.status(400).json({
            Success:false,
            Message:"Sorry you have not purchased this course"
        })
     }
     const oldrating=await Ratings.findOne({user:userid,course:courseid})
    //  console.log(oldrating);
     if(oldrating){
        return res.status(400).json({
            Success:false,
            Message:"Sorry you have already reviewed this course"
        })
     }
     const newreview=await Ratings.create({user:userid,rating:rating,review:review,course:courseid});
     await Course.findByIdAndUpdate({_id:courseid},{$push:{ratingsandreview:newreview._id}})
     return res.status(200).json({
        Success:true,
        Message:"Review created successfully"
     })
    }catch(err){
    console.log("Error while creating review","=>",err);
    return res.status(500).json({
        Success:false,
        Message:"Error while creating review"
    })
    }
}



exports.getaveragerating=async(req,res)=>{
    try{
        const {courseid}=req.body;
        const result=await Ratings.aggregate([
            {
                $match:{
                  course:new mongoose.Types.ObjectId(courseid)
                }
            },
            {
                $group:{
                    _id:null,
                    averagerating:{$avg:"$rating"}
                }
            }
        ])
        if(result.length===0){
            return res.status(200).json({
                Success:true,
                Message:"No ratings provided yet",
                Averagerating:0
            })
        }
        return res.status(200).json({
            Success:true,
            Message:"Ratings fetched successfully",
            Averagerating:result[0].averagerating
        })
    }catch(err){
       console.log("Error while fetching rating","=>",err);
       return res.status(500).json({
        Success:false,
        Message:"Error while fetching rating"
       })
    }
}


exports.getallrating=async(req,res)=>{
    try{
      
        const ratings=await Ratings.find({}).sort({rating:-1}).populate({
            path:"user",
            select:"firstname lastname profilephoto email"
        }).populate({
            path:"course",
            select:"title"
        }).exec();
        return res.status(200).json({
            Success:false,
            Message:"Ratings fetched successfully",
            Ratings:ratings
        })
    }catch(err){
     console.log("Error while fetching all ratings","=>",err);
     return res.status(500).json({
        Success:false,
        Message:"Error while fetching all ratings"
     })
    }
}



exports.getratingononecourse=async(req,res)=>{
    try{
        const {courseid}=req.body;
        const ratings=await Ratings.aggregate([
            {
                $match:{_id:{course:new mongoose.Types.ObjectId(courseid)}}
            },
            {
                $sort:{rating:-1}
            }
        ]).populate({
            path:"user",
            select:"firstname lastname profilephoto email"
        }).exec();
        return res.status(200).json({
           Success:true,
           Message:"Ratings fetched suucessfully",
           Ratings:ratings
        })
    }catch(err){
     console.log("Error while fetching all ratings","=>",err);
     return res.status(500).json({
        Success:false,
        Message:"Error while fetching all ratings"
     })
    }
}