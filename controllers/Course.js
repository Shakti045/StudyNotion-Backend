const Course=require('../models/course');
const Category=require('../models/category');
const User=require('../models/user')
const rating=require('../models/rating')
const uploadmedia=require('../utils/file');
const  mongoose  = require('mongoose');
exports.createcourse=async (req,res)=>{
    try{
     let {title,description,language,price,whatwillyoulearn,category,tags,requirements}=req.body
     if(!title || !description || !language || !price || !whatwillyoulearn || !category || !requirements){
        return res.status(400).json({
            "Success":false,
            "Message":"All fields required"
        })
     } 
     category=category.charAt(0).toUpperCase() + category.substring(1);
     const Categoryfound=await Category.findOne({name:category});
     if(!Categoryfound){
        return res.status(400).json({
            "Success":false,
            "Message":"Your Category is not created by admin kindly request to admin"
        })
     }
     const thumbnail=req.files.thumbnail;
     const uploadedfile=await uploadmedia(thumbnail);
     const {id}=req.user;
     const newcourse=await Course.create({title:title,description:description,language:language,price:price,whatwillyoulearn:whatwillyoulearn,instructor:id,thumbnail:uploadedfile.secure_url,category:Categoryfound._id,tags:Array.from(JSON.parse(tags)),requirements:Array.from(JSON.parse(requirements))});
     const updateduser=await User.findByIdAndUpdate({_id:id},{$push:{coursesenrolled:newcourse._id}},{new:true})
     const updatedcategory=await Category.findByIdAndUpdate({_id:Categoryfound._id},{$push:{relatedcourses:newcourse._id}},{new:true});
    //  console.log(updateduser," ",updatedcategory);
     return res.status(200).json({
        "Success":false,
        "Message":"Cousrse created successsfully",
        course:newcourse
     })

    }catch(err){
        console.log("Error while creating the course","=>",err);
        return res.status(500).json({
            "Success":false,
            "Message":"Error while creating the course"
        })
    }
}


exports.getallcourses=async (req,res)=>{
   try{
      const courses=await Course.find({status:"Published"}).populate({
        path:"instructor",
        select:"profilephoto firstname lastname"
    }).populate({
        path:"category",
        select:"name _id"
    }).exec();;
      return res.status(200).json({
        "Success":true,
        "Message":"Courses fetched successfully",
        "Courses":courses
      })
   }catch(err){
    console.log("Error while fetching all course","=>",err)
    return res.status(500).json({
        "Success":false,
        "Message":"Error while fetching all course"
    })
   }
}

exports.deletecourse=async (req,res)=>{
try{
    const {courseid}=req.body;
    const {id}=req.user;
    const course=await Course.findByIdAndDelete({_id:courseid});
    let ratings=course.ratingsandreview;
    ratings=Array.from(ratings);
    console.log(ratings);
    await User.findByIdAndUpdate({_id:id},{$pull:{coursesenrolled:courseid}})
    await Category.findByIdAndUpdate({_id:course.category},{$pull:{relatedcourses:courseid}})
    await rating.deleteMany({_id:{$in:ratings}});
    return res.status(200).json({
        "Success":true,
        "Message":"Course deleted successfully"
    })
}catch(err){
  console.log("Error while eleting the course","=>",err);
  return res.status(500).json({
    "Succes":false,
    "Message":"Error while eleting the course"
  })
}
}


exports.getdetailsofcourse=async (req,res)=>{
    try{
        const {courseid}=req.body;
        const coursedetail=await Course.findOne({_id:courseid}).populate({
            path:"instructor",
            select:"profilephoto firstname lastname"
        }).populate({
            path:"sections",
            populate:{
                path:"subsections",
                select:"subsectionname"
            }
        }).populate("ratingsandreview").populate("category").exec();
        if(!coursedetail){
            return res.status(400).json({
                Succes:false,
                Message:"Couldnot find the course"
            })
        }
        return res.status(200).json({
            Success:true,
            Message:"Dta fetched successfully",
            details:coursedetail,
        })
    }catch(err){
        console.log("Error while fetching coursedetails","=>",err);
        return res.status(500).json({
            Succes:false,
            Message:"Error while fetching coursedetails"
        })
    }
}

exports.updatecourse=async(req,res)=>{
    try{
    const {_id,title,description,language,price,whatwillyoulearn,category,tags,status,requirements}=req.body;
        if(!_id){
            return res.status(404).json({
                Succes:false,
                Message:"Sorry Course id is missing"
            })
        }
        const courseid=new mongoose.Types.ObjectId(_id);
        let thumbnail=null;
         req.files?thumbnail=req.files.thumbnail:null;
       let uploadedfile=null;
       if(thumbnail!==null){
         uploadedfile=await uploadmedia(thumbnail);
       }
       const tobeupdate={};
       if(title){
        tobeupdate.title=title;
       }
       if(description){
        tobeupdate.description=description;
       }
       if(language){
        tobeupdate.language=language;
       }
       if(price){
        tobeupdate.price=price;
       }
       if(whatwillyoulearn){
        tobeupdate.whatwillyoulearn=whatwillyoulearn;
       }
       if(category){
        tobeupdate.category=category;
       }
       if(tags){
        tobeupdate.tags=Array.from(JSON.parse(tags));
       }
       if(status){
        tobeupdate.status=status;
       }
       if(requirements){
        tobeupdate.requirements=Array.from(JSON.parse(requirements));
       }
       if(thumbnail!==null){
        tobeupdate.thumbnail=uploadedfile.secure_url;
       }
      const updatedcourse= await Course.findOneAndUpdate({_id:courseid},{...tobeupdate},{new:true}).populate({
        path:"sections",
        populate:{
            path:"subsections"
        }
      }).exec();
       return res.status(200).json({
        Succes:true,
        Message:"Course Updated Successfully",
        updatedcourse:updatedcourse
       })
    }catch(err){
        console.log("Error while updating the course","=>",err);
        return res.status(500).json({
            Succes:false,
            Message:"Error while updating the course"
        })
    }
}

exports.getcoursesofuser=async (req,res)=>{
    try{
        const {id}=req.user;
        if(!id){
            return res.status(404).json({
                Succes:false,
                Message:"Invalid Request"
            })
        }
        const {coursesenrolled}=await User.findById({_id:id}).populate({
            path:"coursesenrolled",
            populate:{
                path:"sections",
                populate:{
                    path:"subsections"
                }
            }
        }).exec();
        return res.status(200).json({
            Succes:true,
            Message:"Data fetched successfully",
            courses:coursesenrolled
        })
    }catch(err){
        console.log("Error while getting user courses","=>",err);
        return res.status(500).json({
          Succes:false,
          Message:"Error while getting user courses"
        })
    }
}



exports.updatecoursestatus=async(req,res)=>{
    try{
    const {_id,status}=req.body;
        if(!_id){
            return res.status(404).json({
                Succes:false,
                Message:"Sorry Course id is missing"
            })
        }
        const courseid=new mongoose.Types.ObjectId(_id);
       
       await Course.findOneAndUpdate({_id:courseid},{status:status})
       return res.status(200).json({
        Succes:true,
        Message:"Course Updated Successfully"
       })
    }catch(err){
        console.log("Error while updating the course","=>",err);
        return res.status(500).json({
            Succes:false,
            Message:"Error while updating the course"
        })
    }
}
