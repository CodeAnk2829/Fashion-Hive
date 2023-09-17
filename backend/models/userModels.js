const mongoose =require("mongoose");
 const validator= require("validator");
 const bcrypt =require("bcryptjs");
 const jwt =require("jsonwebtoken");
 const crypto=require("crypto");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"],
        maxlength:[30,"name can not exceed"],
        minlength:[4,"name should have more than 4 character"]
    },
    email:{
        type:String,
        required:[true,"please enter your name"],
        unique:true,
         validate:[validator.isEmail,"plaese enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"please enter your password"],
        minlength:[8,"password should be greater than 8"],
        // select:false
    },
    verified:{
        type:Boolean,
        default:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"uesr",
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
       next();
    }
    this.password =await  bcrypt.hash(this.password,10);
})
userSchema.methods.getJWTToken =function () {
    return jwt.sign({id: this._id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRE,
    });
};

//compare password;
userSchema.methods.comparePassword =async function(enteredpassword){
    return await bcrypt.compare(enteredpassword,this.password);
}

//generating password reset token
userSchema.methods.getResetPasswordToken =function (){
    const resetToken=crypto.randomBytes(20).toString("hex")
    //hashing and add to usershema
    this.resetPasswordToken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    this.resetPasswordExpire =Date.now()+15*60*1000;
    return resetToken;
}
module.exports =mongoose.model("User",userSchema);