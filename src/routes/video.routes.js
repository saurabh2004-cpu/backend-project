import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import { 
    deleteVideo,
    getVideoById, 
    publishAVideo, 
    updateVideoDetails, 
    updateVideoThumbnail,
    getAllVideos,
    togglePublishStatus,
    getAllUsersVideos,
    getVideosByCatagory,
    incrementVideoViews,
    isLiked
    
} from "../controllers/video.controller.js";



const videoRouter=Router()


videoRouter.route("/upload-video")
.post(
    verifyJwt,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo
)

videoRouter.route("/get-video/:videoId").get(getVideoById)
videoRouter.route("/update-video-details/:videoId").patch(verifyJwt,updateVideoDetails)
videoRouter.route("/update-video-thumbnail/:videoId").patch(verifyJwt,upload.single("thumbnail"),updateVideoThumbnail)
videoRouter.route("/delete-video/:videoId").post(verifyJwt,deleteVideo)
videoRouter.route("/get-channel-all-videos/:channelId").get( getAllVideos);
videoRouter.route("/all-users-videos").get( getAllUsersVideos);
videoRouter.route("/toggle-status/:videoId").post(verifyJwt, togglePublishStatus);

videoRouter.route("/increment-video-views/:videoId").post(verifyJwt,incrementVideoViews);
videoRouter.route("/get-videos-by-catagory/:category").get(getVideosByCatagory);


videoRouter.route("/is-liked/:videoId/userId").get( isLiked);

export default videoRouter