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

videoRouter.route("/get-video").get(verifyJwt,getVideoById)
videoRouter.route("/update-video-details").patch(verifyJwt,updateVideoDetails)
videoRouter.route("/update-video-thumbnail").patch(verifyJwt,upload.single("thumbnail"),updateVideoThumbnail)
videoRouter.route("/delete-video").post(verifyJwt,deleteVideo)
videoRouter.route("/all-videos").get(verifyJwt, getAllVideos);
videoRouter.route("/toggle-status").post(verifyJwt, togglePublishStatus);

export default videoRouter