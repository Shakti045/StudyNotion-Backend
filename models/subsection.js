const mongoose=require('mongoose');
const Subsectionschema=new mongoose.Schema({
    subsectionname:{
        type:String,
        reqired:true,
        trim:true,
    },
    description:{
        type:String,
        trim:true
    },
    duration:{
        type:String,
    },
    videourl:{
        type:String,
        required:true,
    },
    relatedsection:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section"
    }
})

module.exports=mongoose.model("Subsection",Subsectionschema);