import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async ()=>{
    try{
        const connection =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n mongoDB connected successfully:${connection.connection.host} \n`);
    }
    catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

export default connectDB;