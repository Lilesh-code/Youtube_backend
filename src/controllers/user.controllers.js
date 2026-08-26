import asyncHandler from "../utils/asynchandler.js";
import {APIERROR} from "../utils/apierror.js";
import {user} from "../models/user.models.js";
import {uploadoncloudinary} from "../utils/cloudinary.js";
import { APIRESPONSE } from "../utils/apiresponse.js";


const registerUser = asyncHandler(async(req,res)=>{
    //get user from fronted
    //validation-not empty
    //check if user already exist:username,email
    //check for images 
    //check for avatar
    //upload them on cloudinory,avatar
    //create user object-create entry in db
    //remove password and refrence token field from response
    //check for user creation
    //return res

    const {fullname,email,username,password} = req.body
    //collecting data
    console.log("email:",email)
    //validation
    //  if(fullname ===""){
    //     throw new APIERROR(400,"fullname is required");
    //  }
    if ([
        fullname,email,username,password
    ].some((field)=>
    field?.trim()==="")) {
        throw new APIERROR(400,"All fields are requiered")
        
    }
   const existedUser =  await user.findOne({
        $or:[{ username },{ email }]
    })

    if (existedUser) {
        throw new APIERROR(409,"Username or email is already exists ")
        
    }
    console.log(req.files);
    
    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverimageLocalpath = req.files?.coverimage?.[0]?.path;

    if(!avatarLocalpath){
        throw new APIERROR(400,"Avatar file is required")
    }
     
    const avatar = await uploadoncloudinary(avatarLocalpath);
    const coverImage = await uploadoncloudinary(coverimageLocalpath);

    if(!avatar){
        throw new APIERROR(400,"Avatar file is required");
    }
   
    const newUser = await user.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()

    })

  const createduser = await user.findById(newUser.id).select(
    "-password -refreshToken"
  )
  if(!createduser){
    throw new APIERROR(500,"something went wrong by registering the user")
  }



return res.status(201).json(
    new APIRESPONSE(200,createduser,"User registered successfully")
)
   
})

export {registerUser};
