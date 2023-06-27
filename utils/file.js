const cloudinary=require('cloudinary').v2
async function uploadmedia(file,folder="StudyNotion",quality=100){
  try{
    const options={folder,
      resource_type:"auto",
      quality:quality
  }
    return await cloudinary.uploader.upload(file.tempFilePath,options);
  }catch(err){
    console.log("Error while uploading to cloudinary","=>",err);
  }
}

async function uploadinlocalserver(req,res){
  try{
    const file=req.files.file;
    const path= __dirname+ "/localfiles"+ Date.now() + "."+ file.name.split(".").at(-1);
    file.mv(path)
    return res.status(200).json({
      "Success":true,
      "Message":"File uploaded to local system"
    })
  }catch(err){
    req.status(500).json({
      "Success":false,
      "Message":"File uploading to local sytem failed"
    })
  }
}

module.exports=uploadmedia,uploadinlocalserver;