import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    youtube: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

/**
 * Single document pattern
 * Only ONE row will exist
 */
const SocialLinks = mongoose.model("SocialLinks", socialLinksSchema);

export default SocialLinks;
