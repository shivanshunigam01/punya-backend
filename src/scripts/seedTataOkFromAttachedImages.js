import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { Brand } from "../models/Brand.js";
import { Category } from "../models/Category.js";
import { makeSlug } from "../utils/slug.js";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const IMAGE_PATHS = [
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_15b83f28-b387-47f6-8228-39dc208ff3fe-115e7426-09ae-4641-a738-92418fe0faf1.png",
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_68d75ea5-1e29-438b-b0a1-25fe54a11d1e-7cf15c56-b5c9-464e-ade1-75832950e207.png",
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_36a1da0d-4deb-4b3c-bce8-e08ae41a56ab-8797debd-6342-417a-8de1-5cd2e8e761b7.png",
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_fa45c896-5bb6-49b9-8feb-dab0f4130da9-d2dd5dd6-4dab-40ad-8769-7025f262303a.png",
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_dc5a8d2c-103c-4f37-968d-6d91e3344f0c-88d7d380-3b2a-43ee-814d-629fa9f9e1ef.png",
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_c064bcc8-9955-4ef2-80b1-249b69fe032f-a859daae-7c9e-46f1-a204-c76348059477.png",
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_99ec8531-1018-4a7a-97f3-0d5b798876d9-140e5662-3287-4553-a083-197d4295631e.png",
  "C:/Users/Shivanshu/.cursor/projects/c-Users-Shivanshu-Desktop-Codes-new-code-paw/assets/c__Users_Shivanshu_AppData_Roaming_Cursor_User_workspaceStorage_6cb3f98e30f741872270b56f542ae45d_images_241eb8e7-4760-4457-96cb-85e55f834d6e-08dd2a30-01c2-4cf8-81f7-24243d47f737.png",
];

const targetDir = path.join(process.cwd(), "uploads", "imported", "products");

async function ensureBrandCategory() {
  let brand = await Brand.findOne({ slug: makeSlug("TATA OK") });
  if (!brand) {
    brand = await Brand.create({
      name: "TATA OK",
      slug: makeSlug("TATA OK"),
      is_active: true,
    });
  }

  let category = await Category.findOne({
    brand_id: brand._id,
    slug: makeSlug("Used"),
  });
  if (!category) {
    category = await Category.create({
      brand_id: brand._id,
      name: "Used",
      slug: makeSlug("Used"),
      is_active: true,
    });
  }

  return { brand, category };
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { brand, category } = await ensureBrandCategory();
  fs.mkdirSync(targetDir, { recursive: true });

  let count = 0;
  for (let i = 0; i < IMAGE_PATHS.length; i += 1) {
    const sourcePath = IMAGE_PATHS[i];
    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    const ext = path.extname(sourcePath) || ".png";
    const fileName = `tata-ok-used-${i + 1}${ext}`;
    const targetPath = path.join(targetDir, fileName);

    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }

    const imageUrl = `/uploads/imported/products/${fileName}`;
    const name = `TATA OK Used Vehicle ${i + 1}`;
    const slug = makeSlug(name);

    await Product.findOneAndUpdate(
      { slug },
      {
        name,
        slug,
        brand_id: brand._id,
        category_id: category._id,
        short_description: `Certified pre-owned vehicle ${i + 1}`,
        price: 1450000 + i * 25000,
        featured_image: imageUrl,
        gallery_images: [imageUrl],
        specifications: {
          Fuel: "Diesel",
          Type: "Certified Used CV",
          Condition: "Inspected",
        },
        is_active: true,
        is_new_launch: false,
        is_bestseller: i % 2 === 0,
        is_featured: true,
      },
      { upsert: true, new: true }
    );

    count += 1;
  }

  console.log(`Seeded/updated ${count} TATA OK products from attached images.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("TATA OK image seeding failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
