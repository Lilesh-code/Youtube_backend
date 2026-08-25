import mongoose from "mongoose";

const { Schema } = mongoose;


import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
     username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
     },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    
     },
     fullname:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true,
    
     },
     avatar:{
        type:String,//cloudnary url
        required:true,
        
    
     },
      coverImage:{
        type:String,
        
    
     },
     watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"video",

     }],

     password:{
        type:String,
        required:[true,"password is required"]
     },
     refreshToken:{
        type:String
     }




},{timestamps:true})


userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next()
    //hook
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.ispasswordcorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.GenerateAccessToken = function(){
    jwt.sign(
        {
            _id:this,
            email:this,
            username:this,
            fullname:this
            

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.GenerateRefreshToken = function(){
    jwt.sign(
        {
            _id:this,
            email:this,
            username:this,
            fullname:this
            

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

export const user = mongoose.model("user",userSchema);
