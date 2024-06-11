
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiResponse} from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const totalVideos = await Video.countDocuments({ owner: channelId });

    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).select('_id') } });

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    const totalViewsData = await Video.aggregate([
        { $match: { owner: channelId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const totalViews = totalViewsData[0]?.totalViews || 0;

    if (totalVideos === undefined || totalLikes === undefined || totalSubscribers === undefined || totalViews === undefined) {
        throw new ApiError(400, "Error while fetching channel statistics");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { totalVideos, totalLikes, totalSubscribers, totalViews }, "Channel statistics fetched successfully"));

});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [
            { path: 'owner', select: 'username avatar coverImage fullName email' } // Populate owner's details
        ],
    };

    const videos = await Video.paginate
        (
            { owner: channelId },
            options
        
        );

    if (!videos || videos.docs.length === 0) {
        return res
            .status(204)
            .json(new ApiResponse(204, null, "No videos found for this channel!"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});


export {
    getChannelStats, 
    getChannelVideos
    }
