const AWS=require('aws-sdk');
require('dotenv').config();


AWS.config.update({
    accessKeyId: process.env.AMAZON_ACCESS_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
  });
  

exports.s3 = new AWS.S3();

