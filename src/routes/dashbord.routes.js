import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashBord.controller.js";
import { healthcheck } from "../controllers/healthCheckUp.controller.js";

const dashBordRouter=Router()

dashBordRouter.route("/get-channel-videos/:channelId").get(verifyJwt,getChannelVideos)

dashBordRouter.route("/get-channel-stats/:channelId").get(verifyJwt,getChannelStats)

dashBordRouter.route("/get-health-checkup").get(verifyJwt,healthcheck)

export default dashBordRouter