const mongoose=require('mongoose')
const sendemail=require('../utils/mail')
const Userschema= new mongoose.Schema({
    firstname:{
        type:String,
        require:true,
        trim:true
    },
    lastname:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
    },
    role:{
        type:String,
        enum:["Instructor","Admin","Student"],
        required:true,
    },
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile"
    },
    profilephoto:{
        type:String,
    },
    coursesenrolled:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }]
    ,
    courseprogress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Courseprogress"
    }],
    resetpasswordtoken:{
        type:String,
        default:null
    },
    tokenecreated:{
        type:Number,
        default:null
    },
    lastloggedin:{
        type:Date,
        
    },
    orderhistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Orderdetail"
    }]
})

Userschema.post("save",async(doc)=>{
    try{
        await sendemail(doc.email,"StudyNotion User Registration",`<div><h1>Hii,${doc.firstname}</h1><p>Thank you for registering with us,You can now login to your account using your email id</p>
        <p>If you have not requested to open your account kindly reply to this mail within 24 hours</p>
        <p>Thank You</p>
        </div>`)
    }catch(err){
        console.log("error while sending welcome mail","=>",err);
    }
})

module.exports=mongoose.model("User",Userschema)