import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import { 
    deleteTweet, 
    getTweets, 
    postTweet, 
    updateTweet 

} from "../controllers/tweet.controler.js";

const tweetRouter=Router()

tweetRouter.route("/post-tweet").post(verifyJwt,postTweet)
tweetRouter.route("/get-tweets/:channelId").get(getTweets)
tweetRouter.route("/update-tweet/:tweetId").patch(verifyJwt,updateTweet)
tweetRouter.route("/delete-tweet/:tweetId").post(verifyJwt,deleteTweet)


export default tweetRouter