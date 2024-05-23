import mongoose, {isValidObjectId} from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const postTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body

    if(!content){
        throw new ApiError(400,"write anything !")
    }

    const tweet = await Tweet.create(
        {
            content:content
        }
    )
    
    if(!tweet){
        throw new ApiError(400,"error while posting tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"atweet posted successfully"))

})

const deleteTweet= asyncHandler (async(req,res)=>{
    const {tweetId}=req.params

    const deletedTweet =await Tweet.findOneAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"tweet deleted sucessfully"))
})

const updateTweet=asyncHandler(async(req,res)=>{
    const { tweetId } = req.params;
    const {content}=req.body

    if(!content){
        throw new ApiError(400,"content is required")
    }

    const tweet = await Tweet.findOneAndUpdate(
        tweetId,
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )

    if(!tweet){
        throw new ApiError(400,"error while updating tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"tweet updated sucessfully"))
})

const getTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }
    const tweetObjectId = new mongoose.Types.ObjectId(tweetId);

   
    const tweet = await Tweet.aggregate([
        {
            $match: {
                _id: tweetObjectId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id", 
                foreignField: "username", 
                as: "tweetOwner" // Rename the result to tweetOwner
            }
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$tweetOwner", 0] } 
            }
        },
        {
            $project: {
                content: 1,
                owner: 1
            }
        }
    ]);
   
   
    if (tweet.length === 0) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet[0], "Tweet fetched successfully"));
});



export{
    postTweet,
    deleteTweet,
    updateTweet,
    getTweet,
}