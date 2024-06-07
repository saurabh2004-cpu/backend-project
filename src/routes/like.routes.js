import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleTweetLike, toggleVideoLike,existingVideoLike,removeFromLikedVideo } from "../controllers/like.controller.js";


const likeRouter=Router()

likeRouter.route("/toggle-video-like/:videoId").post(verifyJwt,toggleVideoLike)

likeRouter.route("/toggle-comment-like/:commentId").post(verifyJwt,toggleVideoLike)

likeRouter.route("/toggle-tweet-like/:tweetId").post(verifyJwt,toggleTweetLike)

likeRouter.route("/get-liked-video").get(verifyJwt,getLikedVideos)

// likeRouter.route("/get-video-likes-count/:videoId").get(verifyJwt,getVideoLikes) //new

likeRouter.route("/existing-video-like/:videoId").get(verifyJwt,existingVideoLike) //new

likeRouter.route("/remove-from-liked-video/:videoId").post(verifyJwt,removeFromLikedVideo) //new

export default likeRouter