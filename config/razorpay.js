const Razorpay = require("razorpay");
require('dotenv').config();
exports.instance=new Razorpay({
    key_id:process.env.RAZORPAYKEY_ID,
    key_secret:process.env.RAZORPAYKEY_SECRET,
})

