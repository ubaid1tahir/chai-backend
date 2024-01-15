import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { getVideoDurationInSeconds } from "get-video-duration";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.find();
    if(!query){
        return res.status(404).json(new ApiError(404, "Query is required"));
    }


})

const publishAVideo = asyncHandler(async (req, res) => {
    // take the response and send it bask to user to ensure that video is successfully uploaded
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    
    if([title, description].some((field) => field?.trim() === "")){
        throw new ApiError(400, "Title or Description is required");
    }

    let thumbnailLocalPath
    let videoFileLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = await req.files.thumbnail[0].path;
    }

    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoFileLocalPath = await req.files.videoFile[0].path;
    }
    

    const duration = await getVideoDurationInSeconds(videoFileLocalPath)

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required");
    }

    if(!videoFileLocalPath){
        throw new ApiError(400, "Video is required");
    }

    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);
    const videoFileResponse = await uploadOnCloudinary(videoFileLocalPath);

    // if(!thumbnailResponse){
    //     throw new ApiError(400, "Thumbnail is required");
    // }

    // if(!videoFileResponse){
    //     throw new ApiError(400, "Some error in Cloudinary:-Video is required");
    // }

    const video = await Video.create({
        videoFile: videoFileLocalPath,
        thumbnail: thumbnailLocalPath,
        duration: duration,
        title, description,
        owner: req.user._id
    })

    const isVideoUpload = await Video.findById(video._id)

    if(!isVideoUpload){
        throw new ApiError(500, "Something went wrong while uploading the video")
    }

    return res.status(201).json(
        new ApiResponse(200, isVideoUpload, "VIDEO uploaded Successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
