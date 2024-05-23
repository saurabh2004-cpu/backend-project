import mongoose,{Schema} from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';


const subscriptionSchema=new Schema({

    subscriber:{
        type:Schema.Types.ObjectId,   //one who subscribing
        ref:"User",
    },
    channel:{
        type:Schema.Types.ObjectId,   //one to whom subscriber is subscribing
        ref:"User",
    },


},{timestamps:true})

subscriptionSchema.plugin(mongoosePaginate);

export const Subscription=mongoose.model("Subscription",subscriptionSchema)