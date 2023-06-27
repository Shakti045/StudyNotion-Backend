const mongoose=require('mongoose');
const Orderdetailsschema=new mongoose.Schema({
    paymentId:{
        type:String,
        required:true
    },
    courseid:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }],
    purchasedate:{
        type:Date,
        required:true,
        default:Date.now()
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

module.exports=mongoose.model("Orderdetail",Orderdetailsschema);