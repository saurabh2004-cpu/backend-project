import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import mongoosePaginate from "mongoose-paginate-v2";

const videoSchema = new Schema({

    videoFile: {
        type: String, //cloudniry 
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        reqquired: true
    },
    catagory:{
        type:String,
        
    }
    

}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)    //use for mongo db quiries = aggrigation quiries
videoSchema.plugin(mongoosePaginate);

export const Video = mongoose.model("Video", videoSchema)