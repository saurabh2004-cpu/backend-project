import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { 
    addComment, 
    deleteComment, 
    getVideoComments, 
    updateComment 
} from "../controllers/comment.controller.js";

const commentRouter=Router()

commentRouter.route("/add-comment/:videoId").post(verifyJwt,addComment)
commentRouter.route("/update-comment/:commentId").post(verifyJwt,updateComment)
commentRouter.route("/delete-comment/:commentId").post(verifyJwt,deleteComment)
commentRouter.route("/get-video-comments/:videoId").get(verifyJwt,getVideoComments)

export default commentRouter