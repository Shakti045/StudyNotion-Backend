const mongoose=require('mongoose')
require('dotenv').config();
async function connectdb(){
try{
    await mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    console.log("Db connection successfull");
}catch(err){
    console.log("Error while connecting to db","=>",err);
}
}
module.exports=connectdb;