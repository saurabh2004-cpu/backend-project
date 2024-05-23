import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import { 
    deleteTweet, 
    getTweet, 
    postTweet, 
    updateTweet 

} from "../controllers/tweet.controler.js";

const tweetRouter=Router()

tweetRouter.route("/post-tweet").post(verifyJwt,postTweet)
tweetRouter.route("/get-tweet/:tweetId").get(verifyJwt,getTweet)
tweetRouter.route("/update-tweet").patch(verifyJwt,updateTweet)
tweetRouter.route("/delete-tweet").post(verifyJwt,deleteTweet)


export default tweetRouter