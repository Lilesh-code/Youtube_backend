import mongoose from "mongoose"

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videofile:{
            type:String,
            required:true,
        },
        thumbnail:{
            type:String,
            required:true,
        },
        thumbnail:{
            type:String,//cloudnary url
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number,
            required:true,
        },
        views:{
            type:Number,
            default:0,
        },
        published:{
            type:Boolean,
            default:true,
        },
        owner:{
            type:Schema.Types.Objectid,
            ref:"user",
        }

},{timestamps:true})





videoSchema.plugin(mongooseAggregatePaginate);
export const video = mongoose.model("video",videoSchema)