const Section=require('../models/section')
const Course=require('../models/course');
const Subsection = require('../models/subsection');
const  mongoose  = require('mongoose');
exports.createsection=async(req,res)=>{
    try{
        const {sectionname,courseid}=req.body;
        // console.log(sectionname,courseid);
        if(!sectionname || !courseid){
            return res.status(400).json({
                "Success":false,
                "Message":"All fields are required"
            })
        }
        const newsection=await Section.create({sectionname:sectionname,relatedcourse:courseid});
        await Course.findByIdAndUpdate({_id:courseid},{$push:{sections:newsection._id}});
        return res.status(200).json({
            "Success":true,
            "Message":"Section created successfully",
            section:newsection
        })
    }catch(err){
        console.log("Error while creating a section","=>",err)
        res.status(500).json({
            "Success":false,
            "Message":"Category creation failed"
        })
    }
}


exports.deletesection=async (req,res)=>{
    try{
      const {sectionid}=req.body;
      if(!sectionid){
        return res.status(400).json({
            Success:false,
            Message:"Invalid rquest"
        })
      }
      const deletedsection=await Section.findOneAndDelete({_id:sectionid})
      const subsections=deletedsection.subsections;
      await Subsection.deleteMany({_id:{$in:subsections}})
      await Course.updateOne({_id:deletedsection.relatedcourse},{$pull:{sections:sectionid}});
    //   const courseid=deletedsection.relatedcourse;
    //   await Course.findByIdAndUpdate({_id:courseid},{$pull:{sections:sectionid}})
      res.status(200).json({
        Success:true,
        Message:"Section deleted successfully"
      })
    }catch(err){
        console.log("Error while deleting section","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Error while deleting section"
        })
    }
}

exports.updatesection=async(req,res)=>{
    try{
        let {sectionname,sectionid}=req.body;
        if(!sectionid || !sectionname){
            return res.status(400).json({
                Success:false,
                Message:"Invalid rquest"
            })
          }
          sectionid=new mongoose.Types.ObjectId(sectionid)
          const updatedsection=await Section.findByIdAndUpdate({_id:sectionid},{sectionname:sectionname},{new:true}).populate({
            path:"subsections"
          })
          res.status(200).json({
            Success:true,
            Message:"Section updated successfully",
            section:updatedsection
          })
    }catch(err){
        console.log("Error while updating section","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Error while updating section"
        })
    }
}


exports.getsectionsofacourse=async (req,res)=>{
   try{
     const {courseid}=req.body;
     if(!courseid){
        return res.status(404).json({
            Success:false,
            Message:"Course-id is required"
        })
     }

     const data=await Course.findOne({_id:courseid}).populate({
        path:"sections",
        populate:{
            path:"subsections"
        }
     })
     return res.status(200).json({
        Success:true,
        data:data
     })
   }catch(err){
    console.log("Something error occured while getting section data","=>",err);
    return res.status(500).json({
        Success:false,
        Message:"Something error occured while getting section data"
    })
   }
}