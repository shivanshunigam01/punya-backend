import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { initCloudinary } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const uploadsRoot = path.join(process.cwd(), "uploads");

function isLocalUploadPath(value) {
  return typeof value === "string" && value.startsWith("/uploads/");
}

function resolveLocalPath(uploadPath) {
  const clean = uploadPath.replace(/^\/+/, "");
  return path.join(process.cwd(), clean);
}

async function uploadLocalImage(localUploadPath, slug, index) {
  const absolutePath = resolveLocalPath(localUploadPath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  const ext = path.extname(absolutePath) || ".jpg";
  const publicId = `products/migrated/${slug}-${index}${ext.replace(".", "-")}`;
  const result = await cloudinary.uploader.upload(absolutePath, {
    folder: "products/migrated",
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
  return result.secure_url;
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  initCloudinary();

  const products = await Product.find({
    $or: [
      { featured_image: { $regex: "^/uploads/" } },
      { gallery_images: { $elemMatch: { $regex: "^/uploads/" } } },
    ],
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    let changed = false;
    const slug = product.slug || product._id.toString();

    if (isLocalUploadPath(product.featured_image)) {
      const cloudUrl = await uploadLocalImage(product.featured_image, slug, 0);
      if (cloudUrl) {
        product.featured_image = cloudUrl;
        changed = true;
      } else {
        skipped += 1;
      }
    }

    if (Array.isArray(product.gallery_images) && product.gallery_images.length) {
      const nextGallery = [];
      for (let i = 0; i < product.gallery_images.length; i += 1) {
        const current = product.gallery_images[i];
        if (!isLocalUploadPath(current)) {
          nextGallery.push(current);
          continue;
        }
        const cloudUrl = await uploadLocalImage(current, slug, i + 1);
        if (cloudUrl) {
          nextGallery.push(cloudUrl);
          changed = true;
        } else {
          nextGallery.push(current);
          skipped += 1;
        }
      }
      product.gallery_images = nextGallery;
    }

    if (changed) {
      await product.save();
      updated += 1;
    }
  }

  console.log(`Migrated product images for ${updated} products. Skipped files: ${skipped}`);
  await mongoose.disconnect();
}

migrate().catch(async (error) => {
  console.error("Product image migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
