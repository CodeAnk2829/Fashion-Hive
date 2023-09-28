const ErrorHander = require('../utils/errorhander');
const sendToken = require('../utils/jwtToken');
const catchAsyncErrors=require('../middleware/catchAsyncErrors');
const User = require("../models/userModels.js");
const sendEmail=require("../utils/Mail.js");
const crypto=require("crypto");
const { json } = require('body-parser');
const cloudinary=require("cloudinary");

//Register User
exports.getRegisterPage = async(req, res) => {
    res.render('register');
}

exports.registerUser = catchAsyncErrors(async (req,res,next)=>{
    const {name, email, password} = req.body;
  
    // const mycloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
    //     folder:"avatars",
    //     width:150,
    //     crop:"scale"    
    // });
    // console.log("after mycloud");
    
    const user = new User({
        name: name,
        email: email,
        password: password,
        // avatar:{
        //     public_id:mycloud.public_id,
        //     url:mycloud.secure_url,
        // },
        resetPasswordToken:"",
    });
    console.log(user);
    const resetPasswordToken = await user.getResetPasswordToken();
    user.resetPasswordToken = resetPasswordToken
    await user.save();
    sendEmail(email,resetPasswordToken);
    console.log(req.params.id);
    sendToken(user,201,res);
})

//email verification
exports.verification =catchAsyncErrors(async(req,res,next)=>{
    
    const token = req.params.token;
   const user =await User.findOne({resetPasswordToken:token})
    if (!user) {
      return res.status(404).json({ message: 'Invalid verification token.' });
    }
    user.verified = true;
    user.resetPasswordToken=""
    await user.save();
    res.json({ message: 'Email verification successful.' });
});

exports.getLoginPage = async (req, res) => {
    res.render('login');
}

//login user
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;
    //checking if user has given password and email both
    if(!email || !password){
        return next(new ErrorHander("please enter email & password",400));
    }
    const user = await User.findOne({email}).select("+password");
    const isPasswordMatched =await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHander("Invalid email or password",401));
    }
     if(user.verified!=true)
     {
         return next(new ErrorHander("email is not verified",401));
     }
   
    if(!user){
        return next(new ErrorHander("invalid email or password",401));
    }
   sendToken(user,200,res);
})


// logout user
exports.logout =catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    });
    res.status(200).json({
        success:true,
        message:"log out",
    });
    next();
});
// ---------------start not working-----------------------

//forgot password
// ------------ end not working--------------
//get user details
exports.getUserDetails =catchAsyncErrors(async(req,res,next)=>{
    const user =await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    });
});

//update the password or funtion of change the password;
exports.updatePassword =catchAsyncErrors(async(req,res,next)=>{
    const user =await User.findById(req.user.id).select("+password");

    const isMatched =await user.comparePassword(req.body.oldPassword);
    if(!isMatched){
        return next(new ErrorHander("old password is incorrect",401));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("password does not match",401));
    }
    user.password =req.body.newPassword;
    await user.save();
    sendToken(user,200,res); 
});

exports.updateprofile =catchAsyncErrors(async(req,res,next)=>{
    const newUserData ={
        name:req.body.name,
        email:req.body.email,
    };
    //we will add cloudinary later

    const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        user
    });
});

//get all user details by admin
exports.getAllUser = catchAsyncErrors(async(req,res,next)=>{
    const users = await user.find();
    res.status(200).json({
        success:true,
        users,
    });
});


//get datails of single user by admin
exports.getSingleuser = catchAsyncErrors(async(req,res,next)=>{
    const user = await user.findById(req.params.id);
    if(!user)
    {
        return next(
            new ErrorHander(`user does not exist with id:${req.params.id}`)
        );
    }
    res.status(200).json({
        success:true,
        user,
    });
});

//update the role of the admin by admin
exports.updateUserRole =catchAsyncErrors(async(req,res,next)=>{
    const newUserData ={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };
    //we will add cloudinary later

    const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        user
    });
});

//delete user by admin
exports.deleteUser =catchAsyncErrors(async(req,res,next)=>{
   const user =await User.findById(req.params.id);
   if(!user)
   {
    return next(new ErrorHander(`user does not exist:${req.params.id}`));
    
   }
   await user.remove();
    res.status(200).json({
        success:true,
        user
    });
});

