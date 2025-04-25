import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
// import sanitize from "sanitize-html";

const addCommentOnVideo = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "Valid video id is required");
  }
  if (!comment) {
    throw new apiError(400, "Comment is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const sanitizedComment = sanitizeHtml(comment, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
  });

  const newComment = await Comment.create({
    content: sanitizedComment,
    video: videoId,
    owner: userId,
  });

  if (!newComment) {
    throw new apiError(401, "Unable to add comment on video");
  }

  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        { Comment: newComment },
        "Comment added Successfully"
      )
    );
});

const updateVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;
  const userId = req.user._id;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new apiError(400, "Valid Comment id is required");
  }
  if (!comment) {
    throw new apiError(400, "Comment is required");
  }

  const existingComment = await Comment.findById(commentId);
  if (!existingComment) {
    throw new apiError(404, "Comment not found");
  }

  if (existingComment.owner.toString() !== userId.toString()) {
    throw new apiError(403, "You are not authorized to update comment");
  }

  const sanitizedComment = sanitizeHtml(comment, {
    allowedTags: [],
    allowedAttributes: [],
  });

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: sanitizedComment,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new apiError(404, "No comment found for this comment id");
  }

  console.log("updatedComment: ", updatedComment.content);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { updatedComment: updatedComment },
        "Comment updated Successfully"
      )
    );
});

const deleteVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new apiError(400, "Valid comment id is required");
  }

  const existingComment = await Comment.findById(commentId);
  if (!existingComment) {
    throw new apiError(404, "Comment not found with this comment id");
  }

  if (existingComment.owner.toString() !== userId.toString()) {
    throw new apiError(403, "You are not authorized to delete comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Comment deleted Successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "Valid video id is required");
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: {
      path: "owner", 
      select: "username avatar", 
    },
  };

  const result = await Comment.paginate({ video: videoId }, options);

  if (!result.docs || result.docs.length === 0) {
    throw new apiError(404, "No comments found for this video");
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalDocs: result.totalDocs,
        comments: result.docs,
        totalPages: result.totalPages,
        currentPage: result.page,
      },
      "Comments fetched successfully"
    )
  );
});

export {
  addCommentOnVideo,
  updateVideoComment,
  deleteVideoComment,
  getVideoComments,
};
