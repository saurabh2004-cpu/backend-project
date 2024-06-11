import mongoose, {isValidObjectId} from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import ApiResponse from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const postTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body

    if(!content){
        throw new ApiError(400,"write anything !")
    }

    const tweet = await Tweet.create(
        {
            content:content,
            owner:req.user._id
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
    .json(new ApiResponse(200,deletedTweet.content,"tweet deleted sucessfully"))
})

const updateTweet=asyncHandler(async(req,res)=>{
    const { tweetId } = req.params;
    const {content}=req.body

    if(!content){
        throw new ApiError(400,"content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
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

const getTweets = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required!");
    }

   
    const tweets = await Tweet.find({ owner: channelId }).populate( [{ path: 'owner', select: 'username avatar' } 
    ]);

    

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});



export{
    postTweet,
    deleteTweet,
    updateTweet,
    getTweets,
}