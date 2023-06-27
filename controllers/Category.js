const  mongoose  = require('mongoose');
const Category=require('../models/category')
const Course=require('../models/course')
exports.createcategory=async (req,res)=>{
    try{
       let {name,description}=req.body;
        if(!name || !description){
            return res.status(400).json({
                "Success":false,
                "Message":"All fields required"
            })
        }
        const categoryfound=await Category.findOne({name:name});
        if(categoryfound){
            return res.status(400).json({
                "Success":false,
                "Message":"Category already exists"
            })
        }
        name=name.charAt(0).toUpperCase() + name.substring(1);
        await Category.create({name:name, description:description})
        return res.status(200).json({
            "Success":true,
            "Message":"Category created successfully"
        })
    }catch(err){
        console.log("Error while creating Category","=>",err)
        return res.status(500).json({
            "Success":false,
            "Message":"Category creation failed"
        })
    }
}

exports.getallcategory=async (req,res)=>{
    try{
        const categories=await Category.find({});
        return res.status(200).json({
            "Success":true,
            "Message":"All tags fetched successfully",
            "Categories":categories
        })
    }catch(err){
        console.log("Error while getting all categories","=>",err)
        return res.status(500).json({
            "Success":false,
            "Message":"Error while getting all categories"
        })
    }
}


exports.getcategoryrelatedcourse=async(req,res)=>{
    try{
        const {categoryid}=req.body;
        const coursesrelatedtocategory=await Category.find({_id:categoryid}).populate({
            path:"relatedcourses",
            match: { status: "Published" },
            select:"title language price thumbnail _id",
            populate:{
                path:"ratingsandreview",
                select:"rating"
            }
        }).exec();
        if(!coursesrelatedtocategory){
            return res.status(404).json({
                Success:true,
                Message:"Not found matched to your category"
            })
        }

      
        const othercourses=await Course.find({category:{$ne:categoryid},status:"Published"}).populate({
            path:"ratingsandreview",
            select:"rating"
        })

        const topratedcoursesids=await Course.aggregate([
            {
                $addFields:{totalstudents:{$size:"$studentsenrolled"}}
            },
            {
                $sort:{totalstudents:-1}
            },
            {
                $limit:3
            },
            {
                $project:{
                    _id:1
                }
            }
        ])
        // console.log(topratedcoursesids);
        let topratedcourses=[];
        for(let courseid of topratedcoursesids){
            let course=await Course.findOne({_id:courseid._id,status:"Published"}).populate({
                path:"ratingsandreview",
                select:"rating"
            })
             if(course!==null){
             topratedcourses.push(course);
             }
        }
        // console.log(topratedcourses);
        return res.status(200).json({
            Success:true,
            Message:"Courses fetched successfully",
            data:{
                coursesrelatedtocategory,
                topratedcourses,
                othercourses
            }
        })
    }catch(err){
        console.log("Error while fetching the courses","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Error while fetching the courses"
        })
    }
}