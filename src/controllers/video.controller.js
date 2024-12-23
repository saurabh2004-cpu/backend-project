import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Like } from "../models/like.model.js"
import mongoose from "mongoose"
import { client } from "../redis/client.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 30, query, sortBy = 'createdAt', sortType = 'desc', } = req.query;

    const { channelId } = req.params

    // Construct filter object
    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    if (channelId) {
        filter.owner = channelId;
    }

    // Construct sort object
    const sort = {};
    sort[sortBy] = sortType === 'asc' ? 1 : -1;

    // Pagination options
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort
    };

    const clientAllVideos = await client.smembers("allVideos")

    if (clientAllVideos) {
        console.log("clientAllVideos", clientAllVideos)
        return res
            .status(200)
            .json(new ApiResponse(200, clientAllVideos, "Videos fetched successfully"));
    }

    try {
        const videos = await Video.paginate(filter, options);

        if (!videos) {
            throw new ApiError(404, "No videos found");
        }

        await client.sadd("allVideos", JSON.stringify(videos))

        return res
            .status(200)
            .json(new ApiResponse(200, videos, "Videos fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, catagory = 'all' } = req.body;

    // console.log(title,description)

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required!");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;


    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required!");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnailFile) {
        throw new ApiError(400, "Video file and thumbnail are required!");
    }



    const video = await Video.create({
        title: title,
        description: description,
        catagory: catagory,
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        duration: videoFile?.duration || 10,
        owner: req.user._id
    });

    if (!video) {
        throw new ApiError(400, "Something went wrong while uploading a video.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully!"));
});

const getVideosByCatagory = asyncHandler(async (req, res) => {
    const { category } = req.params

    const videos = await Video.find({
        catagory: category
    }).populate('owner')


    if (!videos) {
        throw new ApiResponse(201, null, "No video found with selected catagory")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched with selected catagory"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    const video = await Video.findById(videoId).populate([
        { path: 'owner' }
    ])

    if (!video) {
        throw new ApiError(401, "video not found !")
    }

    // const existingLike = await Like.findOne({
    //     video: videoId,
    //     likedBy: userId
    // });

    // const isLiked = existingLike ? true : false;

    return res.status(200).json(new ApiResponse(200, { video }, "Video fetched successfully"));
});


const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(400, "all field are required")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description
            }
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(400, "wrror while updating new details")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "account details updated successfully"))

})

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const thumbnaillocalPath = req.file?.path

    if (!thumbnaillocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }

    const thumbnail = await uploadOnCloudinary(thumbnaillocalPath)

    if (!thumbnail?.url) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    )
    return res
        .status(200)
        .json(new ApiResponse(200, video, "thumbnail image updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params



    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(400, "error while deleting video")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo.title, "Video deleted successfully "))

})

const getAllUsersVideos = asyncHandler(async (req, res) => {

    try {

        const redisData = await client.lrange("allUsersVideos", 0, -1, )

        if (redisData && redisData.length > 0) {
            const parsedData = redisData.map((item) => JSON.parse(item));
            // console.log("Data fetched from Redis:", parsedData[0]);
            return res.json(new ApiResponse(200, parsedData, "All users' videos fetched from cache"));
        } else {

            const allVideos = await Video.find().populate('owner', 'username avatar');

            if (!allVideos) {
                throw new ApiError(400, "Error while fetching all videos");
            }

            // console.log("allVideos from db", allVideos[0])
            allVideos.forEach(async (item) => {
                await client.rpush("allUsersVideos", JSON.stringify(item));
            })

            client.expire("allUsersVideos", 3600);

            return res
                .status(200)
                .json(new ApiResponse(200, allVideos, "Videos successfully fetched"));

        }
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Internal Server Error"));
    }
});


//update this func :todo
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }


    video.isPublished = !video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video publish status updated successfully"));
});


const incrementVideoViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    try {
        const video = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        return res
            .status(200)
            .json(new ApiResponse(200, video, "video view incremented"))
    } catch (error) {
        throw new ApiError(400, "Error while incrementing")
    }
})


////////////////////////////////////////////////////////////////
const isLiked = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { userId } = req.params;

    const uId = mongoose.Types.ObjectId.createFromHexString(userId);
    const vidId = mongoose.Types.ObjectId.createFromHexString(videoId);

    const clientisLiked = await client.smembers(`isLiked${videoId}${userId}`);

    if(clientisLiked!=null && clientisLiked.length>0){
        // console.log("clientisLiked",clientisLiked)
        return res.status(200).json(new ApiResponse(200, JSON.parse(clientisLiked), "User like status fetched successfully"));    
    }

    const likeAggregation = await Like.aggregate([
        {
            $match: {
                video: vidId
            }
        },
        {
            $group: {
                _id: "$video",
                likesCount: { $sum: 1 },
                likedBy: { $addToSet: "$likedBy" }
            }
        },
        {
            $addFields: {
                isLiked: { $in: [uId, "$likedBy"] }
            }
        },
        {
            $project: {
                _id: 0,
                likesCount: 1,
                isLiked: 1
            }
        }
    ]);

    const like = likeAggregation[0] || { likesCount: 0, isLiked: false };

    if(!like){
        return new ApiError(400,"Error while fetching like status")
    }

    // console.log("likes fetched from db",like)

    await client.sadd(`isLiked${videoId}${userId}`, JSON.stringify(like));
    client.expire(`isLiked${videoId}${userId}`, 3600);


    return res.status(200).json(new ApiResponse(200, like, "User like status fetched successfully"));
});






export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    updateVideoThumbnail,
    deleteVideo,
    togglePublishStatus,
    getAllUsersVideos,
    incrementVideoViews,
    getVideosByCatagory,
    isLiked
}
