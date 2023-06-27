const mongoose=require('mongoose')
const Sectionschema=new mongoose.Schema({
    sectionname:{
        type:String,
        trim:true,
        required:true,
    },
    subsections:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subsection"
    }],
    relatedcourse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }
})

module.exports=mongoose.model("Section",Sectionschema);