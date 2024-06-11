import {Comment} from "../models/comment.model.js"
import {ApiResponse} from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 100 } = req.query;


    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [
            { path: 'owner', select: 'username avatar' } 
        ]
    };

   
    const comments = await Comment.paginate(
        { video: videoId },
        options
    );

    if (!comments || comments.docs.length === 0) {
        throw new ApiResponse(404,null, "Error while getting video comments or no comments found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Video comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    const{videoId}=req.params
    const {comment}=req.body
    const userId=req.user._id

    const newComment= await new Comment(

        {
            comment:comment,
            video:videoId,
            owner:userId
            
        }
    )
    await newComment.save()

    if(!newComment){
        throw new ApiError(400,"error while posting comment !")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,newComment,"comment sucessfully added on video "))


})

const updateComment = asyncHandler(async (req, res) => {
    const{commentId}=req.params
    const{comment}=req.body

    if(!commentId){
        throw new ApiError(400,"error commentId!")
    }

    const newComment=await Comment.findByIdAndUpdate(
        commentId,
        {
           $set:{
            comment:comment
           }
        },
        {
            new:true
        }
    )

    if(!newComment){
        throw new ApiError(400,"error while updating comment !")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,newComment,"comment sucessfully updated "))
})

const deleteComment = asyncHandler(async (req, res) => {
    const{commentId}=req.params

    if(!commentId){
        throw new ApiError(400,"error commentId!")
    }

    const deletedComment=await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(400,"error while deleting comment !")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"comment sucessfully deleted "))
})


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }