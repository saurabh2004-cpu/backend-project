import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // Check for missing fields
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required!");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    // Check for missing files
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
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        duration: videoFile?.duration || 10,
    });

    if (!video) {
        throw new ApiError(400, "Something went wrong while uploading a video.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully!"));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video =await Video.findOne(videoId)

    if(!video){
        throw new ApiError(401,"video not found !")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"video fetched successfully "))
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const {title,description}=req.body
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!title || !description || !thumbnailLocalPath){
        throw new ApiError(400,"any one field is required :title ,description,thumbnail")
    }
    
    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(400,"error while uploading new thumbanail")
    }
    const oldVideoDetails=getVideoById()

    if(!oldVideoDetails){
        throw new ApiError(400,"error while fetching  old video deatils")
    }

    const video= await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title:title?title : oldVideoDetails.title,
                description:description?description :oldVideoDetails.description,
                thumbnail:thumbnail?.url ||  oldVideoDetails.thumbnail
            }
        }
    )

    if(!video){
        throw new ApiError(400,"error while updating new details")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"video details updated successfully "))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const deletedVideo = Video.findOneAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200,deleteVideo.title,"Video deleted successfully "))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}
