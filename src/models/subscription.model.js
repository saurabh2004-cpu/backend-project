import mongoose,{Schema} from "mongoose";

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


const Subscription=mongoose.model("Subscription",subscriptionSchema)