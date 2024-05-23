import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    // Construct filter object
    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    if (userId) {
        filter.owner = userId;
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

    
    const videos = await Video.paginate(filter, options);

    if (!videos) {
        throw new ApiError(404, "No videos found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

   
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
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        duration: videoFile?.duration || 10,
        owner:req.user._id
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
   

    const video =await Video.findOne(videoId)

    if(!video){
        throw new ApiError(401,"video not found !")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"video fetched successfully "))
})

const updateVideoDetails=asyncHandler(async(req,res)=>{
    const { videoId } = req.params;
    const {title,description}=req.body

    if(!title || !description){
        throw new ApiError(400,"all field are required")
    }

    const video = await Video.findOneAndUpdate(
        videoId,
        {
            $set:{
                title:title,
                description:description
            }
        },
        {
            new:true
        }
    )

    if(!video){
        throw new ApiError(400,"wrror while updating new details")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"account details updated successfully"))

})

const updateVideoThumbnail=asyncHandler(async(req,res)=>{
    const{videoId}=req.params
    const thumbnaillocalPath = req.file?.path

    if(!thumbnaillocalPath){
        throw new ApiError(400,"avatar file is missing")
    }

    const thumbnail=await uploadOnCloudinary(thumbnaillocalPath)

    if(!thumbnail?.url){
        throw new ApiError(400,"Error while uploading thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail:thumbnail.url
            }
        },
        {
            new:true
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,video,"thumbnail image updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    

    const deletedVideo = await Video.findOneAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200,deletedVideo.title,"Video deleted successfully "))

})


//update this func :todo
const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    const video = await Video.findOne(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    
    video.isPublished = !video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video publish status updated successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    updateVideoThumbnail,
    deleteVideo,
    togglePublishStatus
}
