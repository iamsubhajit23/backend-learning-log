import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const toggleLikeOnVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "Valid video ID is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    likedby: userId,
    video: videoId,
  });

  if (!existingLike) {
    await Like.create({
      likedby: userId,
      video: videoId,
    });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "Video Liked Successfully"));
  }

  await Like.findOneAndDelete({
    likedby: userId,
    video: videoId,
  });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Video unliked Successfully"));
});



export { toggleLikeOnVideo };
