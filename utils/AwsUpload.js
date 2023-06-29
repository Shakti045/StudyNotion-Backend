const {s3}=require('../config/amazon');
const fs=require('fs');
const { getVideoDurationInSeconds } = require('get-video-duration')

 function uploadtoaws(videoFile){ 
  return new Promise((resolve,reject)=>{
    try{
      const params = {
        Bucket: 'studynotion7846',
        Key:videoFile.name,
        Body: fs.createReadStream(`${videoFile.tempFilePath}`)
      };
       s3.upload(params,async (err,data)=>{
          if(err){
            reject("Something went wrong")
          }
          const url=data.Location;
          const duration=await getVideoDurationInSeconds(url);
         resolve([url,duration]);
       })
    }catch(err){
      console.log("Error while uploading to aws","=>",err);
      reject("Something went wrong")
    }
  })
}

module.exports=uploadtoaws;