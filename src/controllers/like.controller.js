import {Like} from "../models/like.model.js"
import {ApiResponse} from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import{Video} from "../models/video.model.js"

const existingVideoLike=asyncHandler(async(req,res)=>{
    const videoId=req.params
    const userId=req.user._id

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy:userId
    })

    if(!existingLike){
        return res
        .status(200)
        .json(new ApiResponse(200,false,"not liked yet"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200,true,"like existing "))

})

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    console.log("userId like controller",userId)
    
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (existingLike) {
        // Unlike
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(2001, null, "UnLiked successfully", { isLiked: false }));
    } else {
        // Like
        const newLike = new Like({
            video: videoId,
            likedBy: userId,
        });
        await newLike.save();
        return res.status(200).json(new ApiResponse(200, newLike, "Likedsuccessfully", { isLiked: true }));
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if (existingLike) {
        // Unlike
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(2001, null, "UnLiked successfully", { isLiked: false }));
    } else {
        // Like
        const newLike = new Like({
            comment: commentId,
            likedBy: userId,
        });
        await newLike.save();
        return res.status(200).json(new ApiResponse(200, newLike, "Likedsuccessfully", { isLiked: true }));
    }
});


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


//not returnning the first [0 th position liked video details ]
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find(
        { 
            likedBy: userId 
        }
    ).populate([
        {
            path:'video'
        },
    ]);

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

const removeFromLikedVideo=asyncHandler(async(req,res)=>{
    const userId=req.user._id
    const{videoId}=req.params

    const removedVideo=await Like.findOneAndDelete({
        likedBy:userId,
        video:videoId
    })

    if(!removedVideo){
        throw new ApiError(400,"Error while removing video from liked videos ")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,removedVideo,"video removed from Liked videos "))
})

const getVideoLikesCount = asyncHandler(async (req, res) => {
    const { videolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videolId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videoObjectId =  new mongoose.Types.ObjectId(videoId);

    const video = await User.findById(videoObjectId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const likes = await Like.aggregate([
        { $match: { video: videoObjectId } },
        {
            $lookup: {
                from: 'videos',
                localField: 'likes',
                foreignField: '_id',
                as: 'likesDetails'
            }
        },
        { $unwind: '$likesDetails' },   //todod know about this operator
        {
            $project: {
                _id: 1,
                likedBy: '$likesDetails._id',
                fullName: '$likesDetails.fullName',
                username: '$likesDetails.username',
                avatar: '$likesDetails.avatar'
            }
        }
    ]);


    return res
        .status(200)
        .json(new ApiResponse(200, likes, "likes fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    // getVideoLikes,
    existingVideoLike,
    removeFromLikedVideo

}