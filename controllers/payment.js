const {instance}=require('../config/razorpay')
const Course=require('../models/course')
const User=require('../models/user')
const mongoose=require("mongoose")
const sendmail=require('../utils/mail')
const {courseEnrollmentEmail}=require('../utils/courseregistrationmailtemplate')
const crypto = require("crypto");
const {paymentSuccessEmail}=require('../utils/paymentsuccessfullemail');
const Orderdetail=require('../models/orderdetails');
// const pdfkit=require('pdfkit');
// const fs=require('fs');
const puppeteer=require('puppeteer');
const sendemailwithfile=require('../utils/mailwithfile');
const {sendreceipttemplate}=require('../utils/sendreceipttemplate');
require('dotenv').config();


exports.capturepayment=async(req,res)=>{
  try{
   const {courses}=req.body;
   let userid=req.user.id;
   userid=new mongoose.Types.ObjectId(userid);
   if(!courses || !userid || courses.length===0){
    return res.status(404).json({
      Success:false,
      Message:"Invalid request"
    })
   }

  let totalprice=0;
   for(const courseid of courses){
    let currentcourse;
    try{
      currentcourse=await Course.findById({_id:courseid});
      if(!currentcourse){
        return res .status(404).json({
          Success:false,
          Message:"Course not found"
        })
      }

      if(currentcourse.studentsenrolled.indexOf(userid)>-1){
        return res.status(400).json({
          Success:false,
          Message:`You already enrolled for  course ${currentcourse.title}`
        })
      }
      totalprice=totalprice+currentcourse.price;
    }catch(err){
      console.log("Error while iterating through courses","=>",err);
      return res.status(500).json({
        Success:false,
        Message:"Sorry some error occured during payment"
      })
    }
  }
  const currency="INR"
  const instanceresponce=await instance.orders.create({
    amount: `${totalprice*100}`,
    currency,
    receipt: `${Date.now().toString()}`,
  })
  // console.log("order initiated successfully");
  // console.log(instanceresponce);
  return res.status(200).json({
    Success:true,
    Message:"Order initiated successfully",
    responce:instanceresponce
  })
  }catch(err){
    console.log("Error while initiatinmg the payment","=>",err);
    return res.status(500).json({
      Success:false,
      Message:"Error while initiating the payment"
    })
  }
}



async function enrollstudent(courses,userid,res){
  try{
     let enrolledstudent;
     for(const courseid of courses){
      try{
         enrolledstudent=await User.findByIdAndUpdate({_id:userid},{$push:{coursesenrolled:courseid}},{new:true});
        if(!enrolledstudent){
          return res.status(404).json({
            Success:false,
            Message:"Error while enrollment of course to student"
          })
        }
        // console.log(enrolledstudent);

        let updatedcourse=await Course.findByIdAndUpdate({_id:courseid},{$push:{studentsenrolled:userid}},{new:true})
        // console.log(updatedcourse);
        if(!updatedcourse){
          return res.status(404).json({
            Success:fale,
            Message:"Erroe while student enrollment to course"
          })
        }
        await sendmail(enrolledstudent.email,"Course registartion confirmation",`${courseEnrollmentEmail(updatedcourse.title,enrolledstudent.firstname)}`);
      }catch(err){
        console.log("Error while iterating in enrollment","=>",err);
        return res.status(500).json({
          Success:false,
          Message:"Error while iterating in enrollment"
        })
      }
     }
     return enrolledstudent;
  }catch(err){
    console.log("Error while registering student after payment","=>",err);
    return res.status(500).json({
      Success:false,
      Message:"Error while registering student after payment"
    })
  }
}


exports.verifysignature=async(req,res)=>{
  try{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature,courses}=req.body;
    // console.log("printing in verifysign",razorpay_payment_id,razorpay_order_id,razorpay_signature,courses);
    const userid=req.user.id;
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userid){
      return res.status(404).json({
        Success:false,
        Message:"Invalid request"
      })
    }
    
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAYKEY_SECRET)
        .update(body.toString())
        .digest("hex");

   if(expectedSignature===razorpay_signature){
     console.log("Payment successfull");
      await enrollstudent(courses,userid,res);
      const orderdetails=await Orderdetail.create({paymentId:razorpay_payment_id,courseid:courses,user:userid});
      const updatedstudent=await User.findByIdAndUpdate({_id:userid},{$push:{orderhistory:orderdetails._id}});
      return res.status(200).json({
        Success:true,
        Message:"Course enrollment successfull",
        updatedstudent:updatedstudent
      })
   }else{
    return res.status(404).json({
      Success:false,
      Message:"Unauthorized payment request"
    })
   }
  }catch(err){
    console.log("Error while verifying signtaure of payment","=>",err);
    return res.status(500).json({
      Success:true,
      Message:"Error while verifying signtaure of payment"
    })
  }
}

exports.sendpaymentconfirmation=async (req,res)=>{
  try{
     const {amount, orderId, paymentId}=req.body;
     let userid=req.user.id;
     userid=new mongoose.Types.ObjectId(userid);
     if(!userid || !amount || !orderId || !paymentId){
      return res.status(404).json({
        Success:false,
        Message:"Invalid request"
      })
     }
     const userfound=await User.findById({_id:userid});
     if(!userfound){
      return res.staus(404).json({
        Success:false,
        Message:"Invalid user id"
      })
     }
 
     await sendmail(userfound.email,"Payment Receive Confirmation",`${paymentSuccessEmail(userfound.firstname,amount/100,orderId,paymentId)}`)

     return res.status(200).json({
      Success:true,
      Message:"PaymentConfirmation mail sent"
     })
  }catch(err){
    console.log("Error while sending payment confirmation mail","=>",err);
    return res.status(500).json({
      Success:false,
      Message:"Error while sending payment confirmation mail"
    })
  }
}



exports.sendpaymentdetails=async(req,res)=>{
  try{
    const {paymentId}=req.body;
    const {email}=req.user;
    if(!paymentId || !email){
      return res.status(404).json({
        Success:false,
        Message:"Invalid Request"
      })
    }
    let payment;
    try{
     payment=await instance.payments.fetch(paymentId);
    }catch(err){
      return res.status(400).json({
        Success:false,
        Message:"Error while getting payment detail"
      })
    }
    const {id,amount,currency,status,order_id,method,description,acquirer_data}=payment;
    const attachmentPath = 'output.pdf'

    const browser = await puppeteer.launch({
      headless:"new",
      // ignoreDefaultArgs: ['--enable-features=NetworkService,NetworkServiceInProcess']
    });
    const page=await browser.newPage();
    // await page.evaluate(()=>{
    //   document.body.style.backgroundColor = 'blue';
    // })
    await page.setContent(`${sendreceipttemplate(id,amount/100,currency,status,order_id,method,acquirer_data.rrn,description,acquirer_data.bank_transaction_id?acquirer_data.bank_transaction_id:acquirer_data.upi_transaction_id,email)}`);
    await page.pdf({path:attachmentPath,format:'A4'});
    await browser.close();
    // console.log('PDF generated successfully:', attachmentPath);

  // const pdfDoc = new pdfkit();
  // const pdfPath = `payment_details_${id}.pdf`;

  // pdfDoc.pipe(fs.createWriteStream(pdfPath));
  // pdfDoc.image("https://glss.website/portals/0/Images/PaymentButton.png");
  // pdfDoc.font('Helvetica-Bold');
  // pdfDoc.fontSize(20).text('Payment Details', { underline: true });
  // pdfDoc.moveDown();

  // pdfDoc.font('Helvetica');
  // pdfDoc.fontSize(12).text(`Payment ID: ${id}`);
  // pdfDoc.fontSize(12).text(`Order ID: ${order_id}`);
  // pdfDoc.fontSize(12).text(`Amount: ${amount/100} ${currency}`);
  // pdfDoc.fontSize(12).text(`Status: ${status}`);
  // pdfDoc.fontSize(12).text(`method: ${method}`);
  // pdfDoc.fontSize(12).text(`description: ${description}`);
  // pdfDoc.fontSize(12).text(`referencenumber: ${acquirer_data.rrn}`);
  // pdfDoc.fontSize(12).text(`transaction-number: ${acquirer_data.bank_transaction_id?acquirer_data.bank_transaction_id:acquirer_data.upi_transaction_id}`);
  // pdfDoc.moveDown();
  // pdfDoc.end();
  
  await sendemailwithfile(email,"Fee Receipt Request",`${paymentSuccessEmail(email,amount/100,order_id,paymentId)}`,`invoice-${paymentId}.pdf`,attachmentPath);

    return res.status(200).json({
      Success:true,
      Message:"Payment details sent successfully"
    })
  }catch(err){
    console.log("Error while sending payment details","=>",err);
    return res.status(500).json({
      Success:false,
      Message:"Error while sending payment details"
    })
  }
}




// exports.capturepayment=async(req,res)=>{
//     try{
//       const {courseid}=req.body;
//       if(!courseid){
//         return res.status(400).json({
//             Success:false,
//             Message:"Please provide valid courseid"
//         })
//       }
//       const userid=req.user.id;
//       const user=await User.findOne({_id:userid})

//       if(!user){
//         return res.status(400).json({
//             Success:false,
//             Message:"Invalid userid"
//         })
//       }
//       const courseobjectid=new mongoose.Types.ObjectId(courseid);
//       if(user.coursesenrolled.indexOf(courseobjectid)!==-1){
//          return res.status(400).json({
//             Success:false,
//             Mesage:"You have already purchased this course"
//          })
//       }
//       const course=await Course.findOne({_id:courseid})
//       if(!course){
//         return res.status(400).json({
//             Success:false,
//             Message:"Invalid course id"
//         })
//       }
//       const amount=course.price;
//       const currency="INR"
//       let uniquenumber=Date.now();
//       for(let i=0;i<6;i++){
//         uniquenumber=uniquenumber+Math.floor(Math.random()*1000);
//           }
//       const options={
//         amount:amount*100,
//         currency:currency,
//         receipt:uniquenumber,
//         notes:{
//            courseid:courseid,
//            userid:userid,
//            username:user.firstname
//         }
//       }
//       const paymentinitiated= instance.orders.create(options);
//       console.log(paymentinitiated);

//       return res.status(200).json({
//         Success:true,
//         Message:"Order created successfully",
//         coursename:course.title,
//         orderid:paymentinitiated.id
//       })
//     }catch(err){
//         console.log("Error while creating payment request","=>",err);
//         return res.status(500).json({
//             Success:false,
//             Message:"Error while creating payment request"
//         })
//     }
// }

// exports.verifysignature=async(req,res)=>{
// try{
//     const webhooksecret=process.env.WEBHOOK_SECRET;
//     const razoraysignature=req.headers("x-razorpay-signature");
   
//     const shasum=crypto.createHmac("sha256",webhooksecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest=shasum.digest("hex");
   
//     if(razoraysignature===digest){
//        console.log(`Payment authorised`);
   
//        const {courseid,userid,username}=req.body.payload.payment.entity.notes;
//        const updateduser=await User.findByIdAndUpdate({_id:userid},{$push:{coursesenrolled:courseid}},{new:true});
//        if(!updateduser){
//         return res.status(500).json({
//             Success:false,
//             Message:"Course addition went wrong"
//         })
//        }
//        const updatedcourse=await Course.findByIdAndUpdate({_id:courseid},{$push:{studentsenrolled:userid}},{new:true})
//        if(!updatedcourse){
//         return res.status(500).json({
//             Success:true,
//             Message:"Error while updating course"
//         })
//        }

//        await sendmail(updateduser.email,"Confirmation about course registration",`${courseEnrollmentEmail(updatedcourse.title,username)}`)

//        return res.status(200).json({
//         Success:true,
//         Message:"Course registration done successfully"
//        })
//     }
// }catch(err){
//   console.log("Error while verifying payment and registering course","=>",err);
//   return res.status(500).json({
//     Success:false,
//     Message:"Error while verifying payment and registering course"
//   })
// }

// }
// async function createinvoice(name,email,productname,amount,quantity,res){
//   const invoiceOptions = {
//     type: 'invoice',
//     customer: {
//       name: `${name}`,
//       email: `${email}`,
//     },
//     line_items: [
//       {
//         name: `${productname}`,
//         amount: `${amount}`,
//         currency: 'INR',
//         quantity: `${quantity}`,
//       },
//     ],
//   };


//   try {
//     const invoice =await instance.invoices.create(invoiceOptions);
//     console.log(invoice.short_url);
//     return invoice.short_url;
//   } catch (error) {
//     console.log("Error in invoice creation","=>",error)
//      return res.status(500).json({
//       Success:false,
//       Message:"Invoice generation failed"
//      })
//   }

// }

