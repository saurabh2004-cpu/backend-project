import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import mongoosePaginate from "mongoose-paginate-v2";

const commentSchema = new Schema(
    {
        comment:{
            type:String,
            required:true
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:true}
)


commentSchema.plugin(mongooseAggregatePaginate)
commentSchema.plugin(mongoosePaginate);

export const Comment=mongoose.model("Comment",commentSchema)