// import { response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose"
import {Video} from "../models/video.model.js"

const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})   //without validation save to database
        return{accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"someonething went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async(req, res) => {
    // response.status(200).json({
    //     message: "ok",
    // })

    //steps 
    // 1.get use detail from frontend
    // 2.validation -not empty etc 
    // 3.check if user already exist :username ,email
    // 4.check from images,check for avatar
    // 5.upload them to cloudinary, avatar
    // 6.create user object- create entry in db
    // 7.remove password and refresh token field from response
    // 8.check for user creation
    // 9.return response 

    //1.get use detail from frontend
    const { fullName, email, username, password } = req.body
    console.log("email :", email);

    //2.validation -not empty etc 
    if ([fullName, email, username, password].some((field) => field ?.trim() === "")) 
    {
        throw new ApiError(400, "all fields are required")
    }

    //3.check if use already exist :username ,email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username is already exist")
    }

    //4.check from images,check for avatar
    const avatarLocalPath = req.files ?.avatar[0] ?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar local file is required")
    }

    //5.upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }

    // 6.create user object- create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage ?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // 7.remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 8.check for user creation
    if (!createdUser) {
        throw new ApiError(500, "something Went wrong while registering a user")
    }


    // 9.return response 
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

// login 

const loginUser=asyncHandler(async(req,res)=>{  
// 1. get user details -req.body->data
// 2. check username or email
// 3. find the user
// 4. password check
// 5. access and refresh token
// 6. send cookie
// 7. send response 


    //1. get user details -req.data->data
    const {email,username,password}=req.body

    //2. check username or email
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    //3. find the user
    const user=await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404,"user does not exist !")
    }

    //4. password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"password does not correct !")
    }

    //5. access and refresh token
    const{accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //6. send cookie
    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,refreshToken
            },
            "User LoggedIn Successfully"
        )
    )

})


// logout
const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1   //removes the field from document
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true,
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))


})


//refres Access token
const refreshAccessToken = asyncHandler(async(req,res)=>{

    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request")
        }
        
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user =await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,newRefreshToken},
                "Access token refreshed"
            )
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }


})


//change password
const changeCurrentPassword=asyncHandler(async(req,res)=>{

    const {oldPassword , newPassword }=req.body //confpassword

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully"))
    
}) 


//get current user
const getCurrentUser = asyncHandler(async(req,res)=>{

    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"current user fetched succusssfully"))
})


//update account details 
const updateAccountDetails=asyncHandler(async(req,res)=>{

    const {fullName,username}=req.body

    if(!fullName || !username){
        throw new ApiError(400,"all field are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                username:username
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"account details updated successfully"))

})


//updatre user avatar 
const updateUserAvatar=asyncHandler(async(req,res)=>{

    const avatarlocalPath = req.file?.path

    if(!avatarlocalPath){
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarlocalPath)

    if(!avatar){
        throw new ApiError(400,"Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar image updated successfully"))

})

//delete old files avatar and coverImage todo

//update user cover image
const updateUserCoverImage=asyncHandler(async(req,res)=>{

    const coverImagelocalPath = req.file?.path

    if(!coverImagelocalPath){
        throw new ApiError(400,"coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImagelocalPath)

    if(!coverImage){
        throw new ApiError(400,"Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image updated successfully"))

})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    if (!channelId) {
        throw new ApiError(400, "channelId is missing");
    }

    try {
        const channel = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(channelId),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    let: { channel_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$channel", "$$channel_id"] },
                                        { $eq: ["$subscriber", new mongoose.Types.ObjectId(userId)] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "isSubscribed",
                },
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    isSubscribed: { $gt: [{ $size: "$isSubscribed" }, 0] },
                },
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                },
            },
        ]);

        if (!channel?.length) {
            throw new ApiError(404, "Channel does not exist");
        }

        return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
    } catch (error) {
        console.error('Error fetching channel:', error);
        throw new ApiError(500, "Internal Server Error");
    }
});

const createWatchHistory=asyncHandler(async(req,res)=>{
const { videoId } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    const history=user.watchHistory.push(videoId);
    await user.save();

    if(!history){
        new ApiError(400,"error while adding video to history")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,null,"video added to history "));
  } catch (error) {
    throw new ApiError(400,"Error while adding video to history ")
  }
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

const AddToWatchLater=asyncHandler(async(req,res)=>{
    const {videoId}= req.params
    const userId=req.user._id
    try {
        const video=await Video.findById(videoId)

        if(!video){
            throw new ApiError(400,"Video Not Found")
        }

        const user=await User.findById(userId)

        if(!user){
            throw new ApiError(400,"user Not Found")
        }


        if (user.watchLater.includes(videoId)) {
            throw new ApiResponse(204, "Video already in watch later list");
          }
      

        const watchLater = user.watchLater.push(videoId)
        await user.save()

        if(!watchLater){
            throw new ApiError(400,"error while adding video to watch later")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,video,"Video added To watch Later "))

    } catch (error) {
        throw new ApiError(400,"Error:video not added to watch later")
    }
})

const getWatchLaterVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId).populate('watchLater');
      
      if (!user) {
        throw new ApiError(400, "User Not Found");
      }
  
      return res.status(200).json(new ApiResponse(200, user.watchLater, "Watch Later videos fetched successfully"));

    } catch (error) {
      return res.status(400).json(new ApiError(400, "Error while fetching watch later videos"));
    }
});

const removeFromWatchLater = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;

    console.log("Id",videoId)

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const video = user.watchLater.pull(videoId);
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200,video, "Video removed from watch later list"));
});

const AddToPlayNext = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    console.log(videoId)

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(400, "Video Not Found");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(400, "User Not Found");
        }

        if (!user.playNext) {
            user.playNext = [];
        }

        if (user.playNext.includes(videoId)) {
            throw new ApiError(400, "Video already in playNext list");
        }

        user.playNext.push(videoId);
        await user.save();

        return res.status(200).json(new ApiResponse(200, user.playNext, "Video added to playNext list"));
    } catch (error) {
        throw new ApiError(400, `Error: ${error.message}`);
    }
});


const getPlayNextVideo=asyncHandler(async(req,res)=>{
    const userId=req.user._id

    try {
      
        const video=await User.findById(userId).populate('playNext')

        if(!video){
            throw new ApiResponse("No video to play next")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,video,"play next video fetched "))
        
    } catch (error) {
        throw new ApiError(400,"Error while fetching next video")
    }
})



export { 
    registerUser, 
    loginUser,
    logoutUser,
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
    AddToPlayNext,      //not working
    getPlayNextVideo,  //not working
    removeFromWatchLater


}

