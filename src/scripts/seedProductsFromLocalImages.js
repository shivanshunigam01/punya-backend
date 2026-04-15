import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { Brand } from "../models/Brand.js";
import { Category } from "../models/Category.js";
import { MediaFile } from "../models/MediaFile.js";
import { makeSlug } from "../utils/slug.js";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const sourceDir =
  process.env.PRODUCT_IMAGES_DIR || "C:/Users/Shivanshu/Downloads/all images";
const targetDir = path.join(process.cwd(), "uploads", "imported", "products");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function titleFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferProductGroup(filename) {
  const name = filename.toLowerCase();

  if (/(ok|used|refurb|pre[-\s]?owned|tata[\s_-]?ok)/.test(name)) {
    return { brand: "TATA OK", category: "Used", price: 1450000, specs: { Fuel: "Diesel", Type: "Certified Used CV" } };
  }
  if (/(starbus|bus|school|staff|winger|van)/.test(name)) {
    const isVan = /(winger|van)/.test(name);
    return {
      brand: "Buses & Vans",
      category: isVan ? "Van" : "Bus",
      price: isVan ? 1695000 : 2550000,
      specs: isVan
        ? { Fuel: "Diesel", Seating: "13 Seater" }
        : { Fuel: "Diesel", Seating: "41 Seater" },
    };
  }
  if (/(ace|intra|yodha|scv|mini|pickup|ev)/.test(name)) {
    const isEv = /ev|electric/.test(name);
    if (isEv) {
      return {
        brand: "SCV",
        category: "Electric SCV",
        price: 995000,
        specs: { Fuel: "Electric", Payload: "1000 kg", Range: "150 km" },
      };
    }
    const isPickup = /(pickup|intra|yodha)/.test(name);
    return {
      brand: "SCV",
      category: isPickup ? "Pickup" : "Mini Truck",
      price: isPickup ? 940000 : 615000,
      specs: { Fuel: "Diesel", Payload: isPickup ? "1300 kg" : "750 kg" },
    };
  }

  if (/(signa|prima|tipper|tractor|5525|5532|4623|4225|4025|3525|2823)/.test(name)) {
    return {
      brand: "Trucks",
      category: "Heavy Duty",
      price: 3650000,
      specs: { Fuel: "Diesel", Power: "250 HP", GVW: "35 Ton" },
    };
  }
  if (/(ultra|lpt|709|1916|t\.?7|t\.?16|t\.?19)/.test(name)) {
    return {
      brand: "Trucks",
      category: "Medium Duty",
      price: 2350000,
      specs: { Fuel: "Diesel", Power: "160 HP", GVW: "19 Ton" },
    };
  }
  return {
    brand: "Trucks",
    category: "Light Duty",
    price: 1750000,
    specs: { Fuel: "Diesel", Power: "120 HP", GVW: "12 Ton" },
  };
}

function collectImageFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectImageFiles(absolutePath));
      continue;
    }
    const extension = path.extname(entry.name).toLowerCase();
    if (allowedExtensions.has(extension)) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function ensureBrandAndCategory(brandName, categoryName) {
  const brandSlug = makeSlug(brandName);
  let brand = await Brand.findOne({ slug: brandSlug });

  if (!brand) {
    brand = await Brand.create({
      name: brandName,
      slug: brandSlug,
      is_active: true,
    });
  }

  const categorySlug = makeSlug(categoryName);
  let category = await Category.findOne({
    brand_id: brand._id,
    slug: categorySlug,
  });

  if (!category) {
    category = await Category.create({
      brand_id: brand._id,
      name: categoryName,
      slug: categorySlug,
      is_active: true,
    });
  }

  return { brand, category };
}

function copyProductImage(sourcePath) {
  const filename = path.basename(sourcePath);
  const targetPath = path.join(targetDir, filename);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }

  return `/uploads/imported/products/${filename.replace(/\\/g, "/")}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  fs.mkdirSync(targetDir, { recursive: true });
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Images folder not found: ${sourceDir}`);
  }

  const imageFiles = collectImageFiles(sourceDir);
  if (!imageFiles.length) {
    throw new Error(`No image files found in: ${sourceDir}`);
  }

  let seededCount = 0;
  for (const filePath of imageFiles) {
    const inferred = inferProductGroup(path.basename(filePath));
    const productName = titleFromFilename(filePath);
    const { brand, category } = await ensureBrandAndCategory(
      inferred.brand,
      inferred.category
    );
    const imageUrl = copyProductImage(filePath);
    const slug = `${makeSlug(productName)}-${seededCount + 1}`;

    await Product.findOneAndUpdate(
      { slug },
      {
        name: productName,
        slug,
        brand_id: brand._id,
        category_id: category._id,
        short_description: `Demo product created from uploaded image: ${path.basename(filePath)}`,
        price: inferred.price,
        featured_image: imageUrl,
        gallery_images: [imageUrl],
        specifications: inferred.specs,
        is_active: true,
        is_new_launch: true,
        is_bestseller: seededCount % 3 === 0,
        is_featured: seededCount < 24,
      },
      { upsert: true, new: true }
    );

    const filename = path.basename(imageUrl);
    await MediaFile.findOneAndUpdate(
      { url: imageUrl },
      {
        url: imageUrl,
        thumbnail_url: imageUrl,
        filename,
        original_filename: filename,
        folder: "products-gallery",
        mime_type: filename.endsWith(".png")
          ? "image/png"
          : filename.endsWith(".webp")
            ? "image/webp"
            : filename.endsWith(".avif")
              ? "image/avif"
              : "image/jpeg",
      },
      { upsert: true, new: true }
    );
    seededCount += 1;
  }

  console.log(`Seeded ${seededCount} products from local images folder.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Product image seeding failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
