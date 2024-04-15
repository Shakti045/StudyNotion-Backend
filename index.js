const express=require('express')
const routes=require('./routes/routes')
const cookieparser=require('cookie-parser')
const connecttodb=require('./config/database')
const connecttocloudinary=require('./config/cloudinary')
const fileupload=require('express-fileupload')
const cookieSession = require("cookie-session");
// const passportSetup = require("./controllers/passport");
const passport=require('passport');
const srouter=require('./routes/socialroutes');
const cors=require('cors')
require('dotenv').config;

const app=express();


app.use(
    cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());


app.use(fileupload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))


app.use(cors({
    origin:"https://studynotionv1.netlify.app",
    credentials:true
}))

const PORT=process.env.PORT || 5000
app.use(express.json())
app.use(cookieparser())
app.use("/api/v1",routes)
app.use("/auth",srouter);


app.listen(PORT,()=>{
    console.log(`Server started on port number ${PORT}`);
})
app.get("/",(req,res)=>{
    res.send("Server is running........")
})

connecttodb();
connecttocloudinary();

