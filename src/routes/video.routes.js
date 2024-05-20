import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { 
    getVideoById, 
    publishAVideo, 
    updateVideoDetails 
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
videoRouter.route("/update-video-details").post(verifyJwt,updateVideoDetails)

export default videoRouter