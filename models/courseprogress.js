const mongoose=require('mongoose');
const courseprogressschema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    completedvideos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subsection"
    }]
})

module.exports=mongoose.model("Courseprogress",courseprogressschema);