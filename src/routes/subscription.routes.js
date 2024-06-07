import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const subscriptionRouter=Router()



subscriptionRouter.route("/toggle-subscription/:channelId").post(verifyJwt,toggleSubscription)

subscriptionRouter.route("/get-channel-subscribers/:channelId").get(verifyJwt,getUserChannelSubscribers)

subscriptionRouter.route("/get-subscribed-channels").get(verifyJwt,getSubscribedChannels)
export default subscriptionRouter