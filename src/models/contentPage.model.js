import mongoose from "mongoose";

const contentPageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    titleEn: {
      type: String,
      default: "",
    },
    titleHi: {
      type: String,
      default: "",
    },
    contentEn: {
      type: String,
      default: "",
    },
    contentHi: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ContentPage = mongoose.model("ContentPage", contentPageSchema);

export default ContentPage;
