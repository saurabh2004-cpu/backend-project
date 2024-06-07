import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import { 
    addVideoToPlaylist, 
    createPlaylist, 
    deletePlaylist, 
    getPlaylistById, 
    getUserPlaylists, 
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playList.controller.js";


const playListRouter=Router()

playListRouter.route("/create-playlist").post(verifyJwt,createPlaylist)


playListRouter.route("/get-all-playlists/:channelId").get(verifyJwt,getUserPlaylists)
playListRouter.route("/get-playlist/:playlistId").get(verifyJwt,getPlaylistById)
playListRouter.route("/add-video-to-playlist/:playlistId/video/:videoId").post(verifyJwt,addVideoToPlaylist)
playListRouter.route("/remove-video/:playlistId/videos/:videoId").post(verifyJwt,removeVideoFromPlaylist)
playListRouter.route("/delete-playlist/:playlistId").post(verifyJwt,deletePlaylist)
playListRouter.route("/update-playlist/:playlistId").post(verifyJwt,updatePlaylist)




export default playListRouter