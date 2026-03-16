// import { v2 as cloudinary } from "cloudinary";

// export const initCloudinary = () => {
//   if (!process.env.CLOUDINARY_CLOUD_NAME) {
//     throw new Error("❌ Cloudinary ENV variables missing");
//   }

//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

//   console.log("✅ Cloudinary initialized");
// };

// // ✅ DEFAULT EXPORT (THIS IS CRITICAL)
// export default cloudinary;


import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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

// ✅ Upload file
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);

    // delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// ✅ Delete file
export const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};

// ✅ DEFAULT EXPORT (for direct cloudinary usage)
export default cloudinary;