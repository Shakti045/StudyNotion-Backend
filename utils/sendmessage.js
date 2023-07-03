const client=require('../config/message')
exports.sendmessage=async (mobilenumber,otp)=>{
  try{
    const message=await client.messages
    .create({
        body: `OTP to verify your information is ${otp}`,
        from: '+14847390633',
        to: mobilenumber
    })
    console.log("Message sent to mobilenumber","=>",message.sid);
  }catch(err){
    console.log("Error while sending message in mobile","=>",err);
  }
}