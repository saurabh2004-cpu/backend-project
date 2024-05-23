import mongoose, {Schema, isValidObjectId} from "mongoose"
import {PlayList} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required!");
    }

    const playList = await PlayList.create({
       name: title,
        description: description,
    });


    return res
        .status(200)
        .json(new ApiResponse(200, playList, "Playlist Created successfully!"));

})


const getUserPlaylists = asyncHandler(async (req, res) => {

    const playlists = await PlayList.find();

    if (!playlists.length) {
        return res
            .status(204)
            .json(new ApiResponse(204, null, "No playlists found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "All playlists fetched successfully"));
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    const playList=await PlayList.findById(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200,playList,"playlist fetched"))
})

//update this
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const {userId}=req.user._id

    const playlist = await PlayList.findByIdAndUpdate(
        playlistId,
        { 
            $addToSet: { videos: videoId },              // $addToSet ensures no duplicates
            $addToSet: { owner: userId },              // $addToSet ensures no duplicates
        },  
        { new: true }                                   
    )
    .populate('videos')                                // Populate the 'videos' field with video documents
    .populate('owner', 'username fullName avatar');    // Populate the 'owner' field with specific user fields

    if (!playlist) {
        throw new ApiError(400, "Error while adding video to the playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to the playlist successfully"));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    
    
    const playlist = await PlayList.findByIdAndUpdate(
        playlistId,
        { $pull: { 
            videos: videoId                 // $pull removes the video ID from the 'videos' array
            } 
        },  
        { new: true }  
    ).populate('videos')  
     .populate('owner', 'username fullName avatar');  

    if (!playlist) {
        throw new ApiError(400, "Error while removing the video from the playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video successfully removed from playlist"));
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
   
    const playList=await PlayList.findOneAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200,playList,"playlist deleted sucessfully"))
})


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required!");
    }

    const playList = await PlayList.findOneAndUpdate(
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