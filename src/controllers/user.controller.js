import { response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"


const registerUser = asyncHandler(async(req, res) => {
    // response.status(200).json({
    //     message: "ok",
    // })

    // 0.steps 
    // 1.get use detail from frontend
    // 2.validation -not empty etc 
    // 3.check if use already exist :username ,email
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
    if ([fullName, email, username, password].some((field) => field ? .trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }

    //3.check if use already exist :username ,email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    //4.check from images,check for avatar
    if (existedUser) {
        throw new ApiError(409, "User with email or username is already exist")
    }

    //4.upload them to cloudinary, avatar
    const avatarLocalPath = req.files ? .avatar[0] ? .path;
    const coverImageLocalPath = req.files ? .coverImage[0] ? .path;

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
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
        coverImage: coverImage ? .url || "",
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
        throw new ApiError(500, "something Went wromng whhile registering a user")
    }

    // 9.return response 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export { registerUser }