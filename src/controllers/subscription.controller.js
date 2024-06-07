import mongoose from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id; 

 
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

   
    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        // Unsubscribe
        await Subscription.deleteOne({ _id: existingSubscription._id });
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        // Subscribe
        const newSubscription = new Subscription({
            subscriber: userId,
            channel: channelId,
        });
        await newSubscription.save();
        return res
            .status(200)
            .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const channelObjectId =  new mongoose.Types.ObjectId(channelId);

    const channel = await User.findById(channelObjectId).select('-password');
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.aggregate([
        { $match: { channel: channelObjectId } },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriberDetails'
            }
        },
        { $unwind: '$subscriberDetails' },   //todod know about this operator
        {
            $project: {
                _id: 1,
                subscriber: '$subscriberDetails._id',
                fullName: '$subscriberDetails.fullName',
                username: '$subscriberDetails.username',
                avatar: '$subscriberDetails.avatar'
            }
        }
    ]);

    // console.log('subscribers:', subscribers); // Debugging

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});



// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const  subscriberId  = req.user._id;

    // console.log(subscriberId)

    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
    }

    const subscriberObjectId = new mongoose.Types.ObjectId(subscriberId);

    const subscriptions = await Subscription.find({ subscriber: subscriberObjectId });

    if (!subscriptions.length) {
        return res.status(200).json(new ApiResponse(204, [], "User has not subscribed to any channels yet!"));
    }

    const channelIds = subscriptions.map(sub => sub.channel);


    const subscribedChannels = await User.aggregate([
        {
            $match: {
                _id: { $in: channelIds }
            }
        },
        {
            $project: {
                _id: 1,
                fullName: 1,
                username: 1,
                avatar: 1,
                email: 1,
                coverImage: 1,
                subscribersCount:1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
});



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}