import {Like} from "../models/like.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import{Video} from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId=req.user._id
    
    const like=await Like.findOne({video:videoId})

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy:userId
    });

    if (like) {
        // Ulike
        await Like.deleteOne({ _id: existingLike._id });
        return res
            .status(200)
            .json(new ApiResponse(200, false, "UnLiked successfully"));
    } else {
        // like
        const newLike = new Like({
            video: videoId,
            likedBy: userId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "likedsuccessfully"));
    }
    

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId=req.user._id
    
    const like=await Like.findOne({comment:commentId})

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy:userId
    });

    if (like) {
        // Ulike
        await Like.deleteOne({ _id: existingLike._id });
        return res
            .status(200)
            .json(new ApiResponse(200, false, "UnLiked successfully"));
    } else {
        // like
        const newLike = new Like({
            comment: commentId,
            likedBy: userId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "likedsuccessfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId=req.user._id
    
    const like=await Like.findOne({tweet:tweetId})

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy:userId
    });

    if (like) {
        // Ulike
        await Like.deleteOne({ _id: existingLike._id });
        return res
            .status(200)
            .json(new ApiResponse(200, false, "UnLiked successfully"));
    } else {
        // like
        const newLike = new Like({
            tweet: tweetId,
            likedBy: userId,
        });
        await newLike.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "likedsuccessfully"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find(
        { 
            likedBy: userId 
        }
    ).select('video');

    if (!likedVideos || likedVideos.length === 0) {
        return res.status(204).json(new ApiResponse(204, null, "No liked videos found!"));
    }

    const videoIds = likedVideos.map(like => like.video);

    const videos = await Video.find(
        { 
            _id: { $in: videoIds } 
        }
    );

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}