import { v2 as cloudinary } from "cloudinary";

export const initCloudinary = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("❌ Cloudinary ENV variables missing");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log("✅ Cloudinary initialized");
};

// ✅ DEFAULT EXPORT (THIS IS CRITICAL)
export default cloudinary;