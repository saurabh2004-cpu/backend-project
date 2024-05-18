// import { response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})   //without validation save to database
        return{accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"someonething went wrong while generating refresh ans access token")
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
    return res.status(201).json(
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
        throw new ApiError(401,"user does not correct !")
    }

    //5. access and refresh token
    const{accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //6. send cookie
    const loggedInUser = await User.findById(user._id)
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
            $set:{
                refreshToken:undefined
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


const refreshAccessToken = asyncHandler(async(req,res)=>{

    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(incomingRefreshToken){
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
            secur:truee
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
export { registerUser , loginUser  , logoutUser , refreshAccessToken }

