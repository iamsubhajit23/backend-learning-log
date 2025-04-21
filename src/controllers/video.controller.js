import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

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
    duration: videoFile.duration,
    videofilepublicid: videoFile.public_id,
    thumbnailpublicid: thumbnailFile.public_id,
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

const getAllVideos = asyncHandler(async(req, res) => {
  //TODO:
})

const deleteVideo = asyncHandler(async(req, res) => {
  const {videoId} = req.params;
  if (!videoId) {
    throw new apiError(400, "Video id is required")
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(400,"No found video with this Video id")
  }

  await deleteFromCloudinary(video.videofilepublicid, "video");
  await deleteFromCloudinary(video.thumbnailpublicid, "image");

  const deletedVideo = await Video.findByIdAndDelete(video._id)

  return res
  .status(200)
  .json(
    new apiResponse(200, deletedVideo, "Video deleted Successfully")
  )
})

const updateThumbnail = asyncHandler(async(req, res) => {
  const {videoId} = req.params
  const thumbnailLocalPath = req.file?.path

  if (!videoId) {
    throw new apiError(400, "Video id is required")
  }
  if (!thumbnailLocalPath) {
    throw new apiError(400, "Thumbnail is required")
  }

  const video = await Video.findById(videoId)
  if (!video) {
    throw new apiError(400, "No video find with this video id")
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new apiError(400, "Error while uploading thumbnail on Cloudinary")
  }

  // after upload file on cloudinary delete previous one
  await deleteFromCloudinary(video.thumbnailpublicid, "image")

  const updatedVideo = await Video.findByIdAndUpdate(
    video._id,
    {
      $set: {
        thumbnail: thumbnail.url,
        thumbnailpublicid: thumbnail.public_id
      }
    },
    {
      new: true
    }
  )

  return res 
  .status(200)
  .json(
    new apiResponse(200, updatedVideo, "Thumbnail updated Successfully")
  )
})

const updateVideoInfo = asyncHandler(async(req, res) => {
  const {title, description} = req.body
  const {videoId} = req.params

  if (!title && !description) {
    throw new apiError(400, "Title or description is required")
  }
  if (!videoId) {
    throw new apiError(400, "Video id is required")
  }

  const videoInfo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        ...(title && { title }),
        ...(description && { description }),
      }
    },
    {
      new: true
    }
  )

  if (!videoInfo) {
    throw new apiError(400, "No video found with this video id")
  }

  return res
  .status(200)
  .json(
    new apiResponse(200, videoInfo, "Video Info Updated Successfully!")
  )

})

const togglePublishStatus = asyncHandler(async(req, res) => {
  const {videoId} = req.params

  if (!videoId) {
    throw new apiError(400, "Video id is required")
  }

  const video = await Video.findById(videoId)
  if (!video) {
    throw new apiError(404, "No video found with this video id")
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    video._id,
    {
      $set: {
        ispublished: !video.ispublished
      }
    },
    {
      new: true
    }
  )
  if (!updatedVideo) {
    throw new apiError(400, "Error while updating video publish status")
  }

  return res
  .status(200)
  .json(
    new apiResponse(200, updatedVideo, "Video publish status toggled successfully")
  )

})

export { 
  uploadVideo,
  getVideoById,
  getAllVideos,
  deleteVideo,
  updateThumbnail,
  updateVideoInfo,
  togglePublishStatus,
 };
