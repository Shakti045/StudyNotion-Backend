const Subsection=require('../models/subsection')
const uploadmedia=require('../utils/file')
const Section=require('../models/section');
const  mongoose  = require('mongoose');
const uploadtoaws=require('../utils/AwsUpload');
exports.createsubsection=async(req,res)=>{
    try{
        const {sectionid,subsectionname,description}=req.body;
        const video=req.files.video;
        if(!sectionid || !subsectionname || !description ||  !video){
            return res.status(400).json({
                Success:false,
                Message:"All fields required"
            })
        }

        const videouploaded=await uploadmedia(video,"StudyNotion",40);
        if(!videouploaded?.secure_url){
            return res.status(500).json({
                Success:false,
                Message:"Error while uploading video"
            })
        }
        // const videouploaded=await uploadtoaws(video);
        // console.log(videouploaded);
       const newsubsection= await Subsection.create({subsectionname,description,videourl:videouploaded?.secure_url,relatedsection:sectionid,duration:videouploaded[1]});
       await Section.findByIdAndUpdate({_id:sectionid},{$push:{subsections:newsubsection._id}});
       res.status(200).json({
        Success:true,
        Message:"Subsection created successfullly",
        subsection:newsubsection
       })
    }catch(err){
        console.log("Error while creating a subsection","=>",err);
        res.status(500).json({
            Success:false,
            Message:"Internal server errror while creating subsection"
        })
    }
}

exports.deletesubsection=async(req,res)=>{
   try{
    const {subsectionid}=req.body;
    if(!subsectionid){
        return res.status(400).json({
            Success:false,
            Message:"Invalid request"
        })
    }
    const {relatedsection}=await Subsection.findByIdAndDelete({_id:subsectionid})
    await Section.findByIdAndUpdate({_id:relatedsection},{$pull:{subsections:subsectionid}});
    return res.status(200).json({
        Success:true,
        Message:"Subsection deleted successfully"
    })
   }catch(err){
    console.log("Error while deleting the subsection","=>",err);
    res.status(500).json({
        Success:false,
        Message:"Error while deleting the subsection"
    })
   }
}

exports.updatesubsection=async(req,res)=>{
    try{
        const {subsectionid,subsectionname,description,duration}=req.body;
        // console.log(subsectionid,subsectionname,description,duration);
        if(!subsectionid){
            return res.status(400).json({
                Success:false,
                Message:"Subsection id is missing"
            })
        }
        let video=null;
        req.files?video=req.files.video:null;
        const tobeupdate={};
        if(video!==null){
            // console.log(video);
         const uploadedvideo=await uploadmedia(video);
        tobeupdate.videourl=uploadedvideo.secure_url;
        tobeupdate.duration=uploadedvideo.duration;
        }
        if(description){
            tobeupdate.description=description;
        }
        if(subsectionname){
            tobeupdate.subsectionname=subsectionname;
        }
        if(duration){
            tobeupdate.duration=duration;
        }
       const updatedsubsection= await Subsection.findByIdAndUpdate({_id:new mongoose.Types.ObjectId(subsectionid)},{...tobeupdate},{new:true});
        return res.status(200).json({
            Success:true,
            Message:"Subsection updated successfully",
            subsection:updatedsubsection
        })

    }catch(err){
        console.log("Error while updating subsection","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Error while updating subsection"
        })
    }
}


