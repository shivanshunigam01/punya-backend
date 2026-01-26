import mongoose from "mongoose";

const MediaFileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    thumbnail_url: String,
    filename: String,
    original_filename: String,
    folder: String,
    size: Number,
    mime_type: String,
    width: Number,
    height: Number,
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const MediaFile = mongoose.model("MediaFile", MediaFileSchema);
