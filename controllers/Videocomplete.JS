const Courseprogress=require('../models/courseprogress');
exports.markascompleted=async(req,res)=>{
    try{
        const {id}=req.user;
        const {courseid,videoid}=req.body;
        if(!id || !courseid || !videoid){
            return res.status(404).json({
                Success:false,
                Message:"Invalid Request",
            })
        }
        const data=await Courseprogress.findOneAndUpdate({user:id,course:courseid},{$push:{completedvideos:videoid}},{new:true});
        if(data){
            return res.status(200).json({
                Success:true,
                Message:"Video Marked As Completed",
                courseprogress:data
            })
        }
       const courseprogress= await Courseprogress.create({user:id,course:courseid,completedvideos:[videoid]});
        return res.status(200).json({
            Success:true,
            Message:"Video Marked As Completed",
            courseprogress:courseprogress
        })
    }catch(err){
     console.log("Error while marking as completed","=>",err);
     return res.status(500).json({
        Success:false,
        Message:"Error while marking as completed"
     })
    }
}