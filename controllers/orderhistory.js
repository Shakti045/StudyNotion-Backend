const User=require('../models/user');
exports.getorderhistory=async(req,res)=>{
    try{
      const {id}=req.user;
      const details=await User.findById({_id:id}).populate({
        path:"orderhistory",
        select:"courseid paymentId purchasedate",
        populate:{
            path:"courseid",
            select:"title  thumbnail"
        }
      })
      return res.status(200).json({
        Success:true,
        Message:"Order history fetched",
        details:details.orderhistory
      })
    }catch(err){
        console.log("Error while getting order history","=>",err);
        return res.status(500).json({
            Success:false,
            Message:"Error while getting order history"
        })
    }
}