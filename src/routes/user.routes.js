import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    createWatchHistory,
    AddToWatchLater,
    getWatchLaterVideos,
    AddToPlayNext,
    getPlayNextVideo,
    removeFromWatchLater

} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router()

router.route("/register").post
    (
        upload.fields(
            [{
                name: "avatar",
                maxCount: 1,
            }, {
                name: "coverImage",
                maxCount: 1
            }]),
        registerUser
    )

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/get-current-user").get(verifyJwt, getCurrentUser)
router.route("/update-account-details").patch(verifyJwt, updateAccountDetails)

router.route("/update-avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)

router.route("/get-channel-profile/:channelId/:userId").get(getUserChannelProfile);
router.route("/watch-history").get(verifyJwt, getWatchHistory)
router.route("/create-watch-history/:videoId").post(verifyJwt, createWatchHistory)

router.route("/add-to-watch-later/:videoId").post(verifyJwt, AddToWatchLater);
router.route("/get-watch-later").get(verifyJwt, getWatchLaterVideos);
router.route("/add-to-play-next/:videoId").post(verifyJwt, AddToPlayNext);
router.route("/get-play-next").get(verifyJwt, getPlayNextVideo);

router.route("/remove-from-watch-later/:videoId").post(verifyJwt, removeFromWatchLater);


//passsport authenticate
import { generateAccessAndRefreshTokens } from '../controllers/user.controller.js'


// Initiates Google OAuth login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route for Google OAuth
router.get(
    '/oauth2/redirect/google',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        // Once authenticated with Google, generate JWT tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(req.user._id);

        const options = {
            httpOnly: true,
            secure: true, // Use `true` if you're using HTTPS
        };

        // Send tokens via cookies or JSON response
        res
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .redirect('http://localhost:5173/dashboard')
    }
);




export default router




