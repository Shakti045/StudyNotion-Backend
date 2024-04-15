const {s3}=require('../config/amazon');
const fs=require('fs');
const { getVideoDurationInSeconds } = require('get-video-duration')

 function uploadtoaws(videoFile){ 
  return new Promise((resolve,reject)=>{
    try{
      const params = {
        Bucket: 'studynotion7846',
        Key:`${Date.now().toString}.mp4`,
        ContentType: 'video/mp4',
        Body: fs.createReadStream(`${videoFile.tempFilePath}`)
      };
       s3.upload(params,async (err,data)=>{
          try{
            if(err){
              reject("Something went wrong")
            }
            console.log(data)
            const url=data.Location;
            const duration=await getVideoDurationInSeconds(url);
           resolve([url,duration]);
          }catch(err){
            console.log("Error while uploading to aws","=>",err);
            reject("Something went wrong")
          }
       })
    }catch(err){
      console.log("Error while uploading to aws","=>",err);
      reject("Something went wrong")
    }
  })
}

module.exports=uploadtoaws;



//  for reference in future
// const {s3}=require('../config/amazon');
// const fs=require('fs');
// const { getVideoDurationInSeconds } = require('get-video-duration')
// const {  PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
//  async function uploadtoaws(videoFile){ 
//    try{
//     const key=`${Date.now().toString()}.mp4`;
//     const params = {
//       Bucket: 'studynotion7846',
//       Key: key,
//       ContentType: 'video/mp4',
//       Body: fs.createReadStream(`${videoFile.tempFilePath}`)
//     };
//     const command = new PutObjectCommand(params);
//     await s3.send(command);
//     const url= await getsignedurl(key);
//     const duration=await getVideoDurationInSeconds(url);
//     return [url,16.0];
//    }catch(err){
//     console.log("Error while uploading to aws","=>",err);
//    }
// }



// async function getsignedurl(objectKey){

//   const command = new GetObjectCommand({
//     Bucket: 'studynotion7846',
//     Key: objectKey
//   });
  
//   const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  
//   return signedUrl;
// }

// module.exports=uploadtoaws;


  // return new Promise((resolve,reject)=>{
  //   try{
  //     const params = {
  //       Bucket: 'studynotion7846',
  //       Key:videoFile.name,
  //       Body:fs.createReadStream(`${videoFile.tempFilePath}`)
  //     };
  //      s3.upload(params,async (err,data)=>{
  //         if(err){
  //           reject("Something went wrong")
  //         }
  //         const url=data.Location;
  //         const duration=await getVideoDurationInSeconds(url);
  //         // generatePresignedUrl('studynotion7846',videoFile.name);
  //        resolve([url,duration]);
  //      })
  //   }catch(err){
  //     console.log("Error while uploading to aws","=>",err);
  //     reject("Something went wrong")
  //   }
  // })
// function generatePresignedUrl(bucketName, objectKey, expiration = 3600) {
//   const params = {
//     Bucket: bucketName,
//     Key: objectKey,
//     Expires:expiration
//   };

//   const url = s3.getSignedUrl('getObject', params);
//   console.log("presigned url is","=>",url);
// }
