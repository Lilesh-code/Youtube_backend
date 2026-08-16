// There are two ways to database connection :one is write the function of database connection in index.js file and 
//second is create a separate db folder and write the code of database connection in that folder and import it in 
//index.js file. I have used the second way to connect the database.
//because it is a professional way to connect database and it is easy to maintain the code in future.


//require('dotenv').config(path:'./env');

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:"./.env"
})
 connectDB()

 .then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running on port ${process.env.PORT||8000}`);
    
    });
    
 })
 .catch((err)=>{
    console.error("MONGO DB CONNECTION FAILED!!!", err);
 })
 app.on("error",(err)=>{
        console.log("can not connect to database ",err);
        throw err;
    }


//connectDB();

//app connection happens through express module and database connection happens through mongoose module.


//database is always in another continent so we need to connect this through internet

//always use try and catch for error handling 
//use async and await because it takes time

// async function connectDB(){
// 
// }





//import mongoose from "mongoose";
//import { DB_NAME } from "./constant";


//import connectDB from "./db/index.js";
import { connect } from "mongoose";

/*
import express from "express";

const myapp = express();

//ifi imidiete run
//database connect
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        myapp.on("error",(err)=>{
            console.log("can not connect to database ",err);
            throw err;
        })
        myapp.listen(process.env.PORT,()=>{
            console.log(`server is running on port ${process.env.PORT}`);
        })
    }
    catch(err){
        console.error("Error connecting to MongoDB:", err);
        throw err;

    }
})()
    */























































