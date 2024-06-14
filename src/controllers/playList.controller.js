import mongoose, { Schema, isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Title and description are required!");
    }

    const playList = await PlayList.create({
        name: name,
        description: description,
        owner: req.user._id,
        // thumbnail:thumbnailFile?.url
    });

    return res.status(200).json(new ApiResponse(200, playList, "Playlist Created successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const playlists = await PlayList.find({ owner: channelId })
        .populate([
            { path: 'owner', select: 'username avatar coverImage' },
            { path: 'videos' }
        ]);

    if (!playlists.length) {
        return res.status(204).json(new ApiResponse(204, null, "No playlists found"));
    }

    return res.status(200).json(new ApiResponse(200, playlists, "All playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    try {
        const playList = await PlayList.findById(playlistId)
            .populate([
                { path: 'owner', select: 'username' },
                { path: 'videos', select: 'title description thumbnail' }
            ]);

        if (!playList) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found"));
        }

        return res.status(200).json(new ApiResponse(200, playList, "Playlist fetched"));
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return res.status(500).json(new ApiResponse(500, null, "Server error"));
    }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await PlayList.findByIdAndUpdate(
        playlistId,
        { 
            $addToSet: { videos: videoId }, // $addToSet ensures no duplicates
        },  
        { new: true }                                   
    )
    .populate('videos') // Populate the 'videos' field with video documents
    .populate([
        { 
            path: 'owner', 
            select: 'username fullName avatar coverImage'
        }
    ]);

    if (!playlist) {
        throw new ApiError(400, "Error while adding video to the playlist");
    }

    return res.status(200).json(new ApiResponse(200, playlist.videos, "Video added to the playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const deletedVideo = await PlayList.findByIdAndUpdate(
        playlistId,
        { 
            $pull: { videos: videoId } // $pull removes the video ID from the 'videos' array
        },  
        { new: true }
    );

    if (!deletedVideo) {
        throw new ApiError(400, "Error while removing the video from the playlist");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video successfully removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const deletedPlayList = await PlayList.findByIdAndDelete(playlistId);

    if (!deletedPlayList) {
        throw new ApiError(400, "Error while deleting the playlist");
    }

    return res.status(200).json(new ApiResponse(200, deletedPlayList.name, "Playlist deleted successfully"));
});

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

    return res.status(200).json(new ApiResponse(200, playList, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
