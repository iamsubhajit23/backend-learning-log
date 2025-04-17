import mongoose, { Schema } from "mongoose";

const playlistModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistModel);
