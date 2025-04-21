import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
  const videoLocalPath = req.files?.videofile[0]?.path;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new apiError(401, "Video is required");
  }

  if (!title && !description) {
    throw new apiError(401, "Title and description both required!");
  }

  if (!thumbnailLocalPath) {
    throw new apiError(401, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  
  if (!videoFile.url) {
    throw new apiError(400, "Error while uploading video on cloudinary!");
  }

  if (!videoFile.duration) {
    throw new apiError(400, "Video duration not found");
  }

  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailFile.url) {
    throw new apiError(400, "Error while uploading thumbnail on cloudinary!");
  }

  //create video object on db
  const video = await Video.create({
    videofile: videoFile.url,
    thumbnail: thumbnailFile.url,
    title,
    description,
    duration: videoFile.duration
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new apiError(500, "Error while upload video");
  }

  return res
    .status(200)
    .json(new apiResponse(200, createdVideo, "Video uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const {videoId} = req.params;// get request from url(params)
  if (!videoId) {
    throw new apiError(400, "videoId is required");Z
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "No Video found with this Video Id!");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, video, "Video fetched Successfully")
    );
});

const getAllVideos = asyncHandler(async(req, res) =>{
  //TODO:
})


export { 
  uploadVideo,
  getVideoById,
  getAllVideos
 };
