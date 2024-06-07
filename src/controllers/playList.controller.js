import mongoose, {Schema, isValidObjectId} from "mongoose"
import {PlayList} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    
    if (!name || !description) {
        throw new ApiError(400, "Title and description are required!");
    }

    const playList = await PlayList.create({
        name: name,
        description: description,
        owner:req.user._id,
        // thumbnail:thumbnailFile?.url
    });


    return res
        .status(200)
        .json(new ApiResponse(200, playList, "Playlist Created successfully!"));

})


const getUserPlaylists = asyncHandler(async (req, res) => {

    const {channelId}=req.params

    const playlists = await PlayList.find({owner:channelId})
    .populate ([
        { path: 'owner', select: 'username avatar coverImage' },
        {path:'videos'}
    ])

    if (!playlists.length) {
        return res
            .status(204)
            .json(new ApiResponse(204, null, "No playlists found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "All playlists fetched successfully"));
});


//this cant fetched first video that is [0]th position
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    const playList=await PlayList.findById(playlistId)
    .populate ( [
        { 
            // path: 'videos', select: 'title description thumbnail owner ',
            path: 'owner', 
        },
        {
            path:'videos'
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,playList,"playlist fetched"))
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await PlayList.findByIdAndUpdate(
        playlistId,
        { 
            $addToSet: { videos: videoId },              // $addToSet ensures no duplicates
        },  
        { new: true }                                   
    )
    .populate('videos')                                // Populate the 'videos' field with video documents
    .populate ( [
        { 
            path: 'owner', 
            select: 'username fullName avatar coverImage'
        }])

    if (!playlist) {
        throw new ApiError(400, "Error while adding video to the playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist.videos, "Video added to the playlist successfully"));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    
    
    const deletedVideo = await PlayList.findByIdAndUpdate(
        playlistId,
        { 
            $pull: { 
            videos: videoId                 // $pull removes the video ID from the 'videos' array
            } 
        },  
        { new: true }  
    )

    if (!deletedVideo) {
        throw new ApiError(400, "Error while removing the video from the playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video successfully removed from playlist"));
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
   
    const deletedPlayList=await PlayList.findOneAndDelete(playlistId)

    if (!deletePlaylist) {
        throw new ApiError(400, "Error while deleting the playlist");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedPlayList.name,"playlist deleted sucessfully"))
})


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required!");
    }

    const playList = await PlayList.findByIdAndUpdate(
        playlistId,
        {
            name: title,
            description: description
        },
        {
            new: true, 
        }
    );

    if (!playList) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playList, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}