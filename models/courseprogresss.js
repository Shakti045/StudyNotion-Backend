const mongoose=require('mongoose')
const Courseprogressschema=new mongoose.Schema({
    courseid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    completedvideos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subsection"
    }]
})

module.exports=mongoose.model("Courseprogress",Courseprogressschema);