const express=require('express')
const router=express.Router();
const {Sendotp,Signup}=require('../controllers/Signup')
const {createcategory,getallcategory,getcategoryrelatedcourse}=require('../controllers/Category');
const {contactus}=require('../controllers/Contactus')
const {createcourse,getallcourses,deletecourse,getdetailsofcourse,updatecourse,getcoursesofuser,updatecoursestatus,getfulldetailsofcourse}=require('../controllers/Course');
const {deleteaccount}=require('../controllers/deleteaccount')
const {login}=require('../controllers/Login')
const {changepassword,resetpasswordtokengeneration,resetpasswod}=require('../controllers/Password')
const {capturepayment,verifysignature,sendpaymentconfirmation,sendpaymentdetails}=require('../controllers/payment')
const {updateprofile,getprofile,getregisteredcourses,getinstructordashboarddata}=require('../controllers/Profile')
const {profilephotoupdate}=require('../controllers/Profilephoto')
const {createrating,getaveragerating,getallrating,getratingononecourse}=require('../controllers/RatingAndReview')
const {createsection,deletesection,updatesection,getsectionsofacourse}=require('../controllers/Section');
const {createsubsection,deletesubsection,updatesubsection}=require('../controllers/Subsection')
const {auth,isInstructor,isstudent,isadmin}=require('../middlewares/authentication')
const {getorderhistory}=require('../controllers/orderhistory');
const {markascompleted}=require('../controllers/Videocomplete')

router.post("/createCourse", auth,isInstructor,createcourse);
router.post("/addSection", auth, isInstructor, createsection);
router.post("/updateSection", auth, isInstructor, updatesection);
router.post("/deleteSection", auth, isInstructor, deletesection);

router.post("/addSubSection", auth, isInstructor,createsubsection);
router.put("/updateSubSection", auth, isInstructor, updatesubsection)
router.delete("/deleteSubSection", auth, isInstructor, deletesubsection);
router.post("/getsectionsofacourse", auth, getsectionsofacourse);

router.get("/getAllCourses", getallcourses)
router.post("/getCourseDetails", getdetailsofcourse)
router.delete("/deleteCourse",auth,isInstructor,deletecourse);
router.post("/updatecourse",auth,isInstructor,updatecourse);
router.get("/getcoursesofuser",auth,getcoursesofuser);
router.put("/updatecoursestatus",auth,updatecoursestatus);
router.post("/getfulldetailsofcourse",auth,getfulldetailsofcourse);

router.post("/createCategory", auth, isadmin, createcategory)
router.get("/showAllCategories", getallcategory)
router.post("/getCategoryPageDetails", getcategoryrelatedcourse);

router.post("/createRating", auth, isstudent, createrating)
router.post("/getAverageRating", getaveragerating)
router.get("/getReviews", getallrating)
router.get("/getCourseRating",getratingononecourse);


router.post("/capturePayment", auth, isstudent, capturepayment);
router.post("/verifySignature",auth,isstudent ,verifysignature);
router.post("/sendpaymentconfirmation",auth,isstudent,sendpaymentconfirmation);
router.post("/sendpaymentdetails",auth,sendpaymentdetails);


router.post("/deleteAccount", auth, deleteaccount)
router.post("/updateProfile", auth, updateprofile)
router.get("/getUserDetails", auth, getprofile)
router.get("/getEnrolledCourses", auth, getregisteredcourses)
router.post("/updateDisplayPicture", auth, profilephotoupdate)
router.get("/getinstructordashboarddata",auth,isInstructor,getinstructordashboarddata);



router.post("/login", login);
router.post("/signup", Signup);
router.post("/sendotp", Sendotp);


router.post("/changepassword", auth, changepassword);
router.post("/reset-password-token", resetpasswordtokengeneration);
router.post("/reset-password", resetpasswod);

router.post("/contactus",contactus);

router.get("/getorderhistory",auth,getorderhistory);

router.post("/markascomplete",auth,markascompleted);

module.exports=router;