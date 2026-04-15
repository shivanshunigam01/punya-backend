import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import { Brand } from "../models/Brand.js";
import { Category } from "../models/Category.js";
import { MediaFile } from "../models/MediaFile.js";
import { makeSlug } from "../utils/slug.js";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const sourceDir = "C:/Users/Admin/Downloads/all images";
const targetDir = path.join(process.cwd(), "uploads", "imported", "products");

const productSeeds = [
  {
    name: "Tata Signa 2821.T",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "Heavy-duty cargo truck built for long-haul fleet and commercial transport operations.",
    price: 2850000,
    specifications: { Power: "200 HP", Fuel: "Diesel", GVW: "28 Ton" },
    files: ["SIGNA-2821T.jpg"],
  },
  {
    name: "Tata Signa 2823.T",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "Reliable heavy-duty tipper configuration for demanding business applications.",
    price: 2925000,
    specifications: { Power: "220 HP", Fuel: "Diesel", GVW: "28 Ton" },
    files: ["SIGNA-2823T.jpg"],
  },
  {
    name: "Tata Signa 3525.T",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "Built for higher payload transport and dependable long-route cargo movement.",
    price: 3390000,
    specifications: { Power: "250 HP", Fuel: "Diesel", GVW: "35 Ton" },
    files: ["SIGNA-3525T.jpg"],
  },
  {
    name: "Tata Signa 4021.S",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "A practical tractor head for logistics fleets and regional haulage.",
    price: 3550000,
    specifications: { Power: "210 HP", Fuel: "Diesel", GVW: "40 Ton" },
    files: ["SIGNA-4021S.jpg"],
  },
  {
    name: "Tata Signa 4025.S",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "Designed for fleet operators looking for stronger highway hauling performance.",
    price: 3680000,
    specifications: { Power: "250 HP", Fuel: "Diesel", GVW: "40 Ton" },
    files: ["SIGNA-4025S.jpg"],
  },
  {
    name: "Tata Signa 4225.T",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "Built for higher tonnage and heavy-load distribution requirements.",
    price: 3820000,
    specifications: { Power: "250 HP", Fuel: "Diesel", GVW: "42 Ton" },
    files: ["SIGNA-4225T.jpg"],
  },
  {
    name: "Tata Signa 4623.S",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "A modern multi-axle tractor for high-uptime transport businesses.",
    price: 4010000,
    specifications: { Power: "230 HP", Fuel: "Diesel", GVW: "46 Ton" },
    files: ["signa-4623s-bnr.jpg"],
  },
  {
    name: "Tata Signa 5532.S",
    brand: "Trucks",
    category: "Heavy Duty",
    shortDescription: "Premium heavy-haul tractor platform for large fleet and infrastructure movement.",
    price: 4590000,
    specifications: { Power: "320 HP", Fuel: "Diesel", GVW: "55 Ton" },
    files: ["Signa 5532.S-3 2.jpg"],
  },
  {
    name: "Tata Ultra T.6",
    brand: "Trucks",
    category: "Light Duty",
    shortDescription: "Compact modern truck for city distribution and light commercial logistics.",
    price: 1550000,
    specifications: { Power: "100 HP", Fuel: "Diesel", GVW: "6 Ton" },
    files: ["ultra-t6.webp"],
  },
  {
    name: "Tata Ultra T.7",
    brand: "Trucks",
    category: "Light Duty",
    shortDescription: "Modern light-duty truck designed for urban movement and quick turnaround operations.",
    price: 1710000,
    specifications: { Power: "120 HP", Fuel: "Diesel", GVW: "7 Ton" },
    files: ["Ultra T.7.png", "ultra-7thumb.jpg"],
  },
  {
    name: "Tata Ultra T.19",
    brand: "Trucks",
    category: "Medium Duty",
    shortDescription: "Medium-duty truck range for higher cargo volumes and highway-ready distribution.",
    price: 2650000,
    specifications: { Power: "180 HP", Fuel: "Diesel", GVW: "19 Ton" },
    files: ["Ultra T.19 Vehicle Image 3.jpg"],
  },
  {
    name: "Tata LPT 709G",
    brand: "Trucks",
    category: "Light Duty",
    shortDescription: "A practical LPT platform for goods transport and local cargo operations.",
    price: 1490000,
    specifications: { Power: "85 HP", Fuel: "Diesel", GVW: "7 Ton" },
    files: ["LPT-709-G.jpg"],
  },
  {
    name: "Tata LPT 1916",
    brand: "Trucks",
    category: "Medium Duty",
    shortDescription: "Trusted medium-duty LPT vehicle for intercity and business cargo movement.",
    price: 2380000,
    specifications: { Power: "160 HP", Fuel: "Diesel", GVW: "19 Ton" },
    files: ["1916-lpt.png"],
  },
  {
    name: "Tata Starbus",
    brand: "Buses & Vans",
    category: "Bus",
    shortDescription: "Passenger bus solution for staff, school, and route transport requirements.",
    price: 2550000,
    specifications: { Power: "155 HP", Fuel: "Diesel", Seating: "41 Seater" },
    files: ["Starbus_11.jpg", "Starbus_16.jpg", "Starbus-nonac_11.png", "Starbus-nonac_11old_0.png"],
  },
  {
    name: "Tata Winger",
    brand: "Buses & Vans",
    category: "Van",
    shortDescription: "Efficient van platform for school, staff, and tour movement needs.",
    price: 1680000,
    specifications: { Power: "100 HP", Fuel: "Diesel", Seating: "13 Seater" },
    files: ["winger-thumbnail.jpg", "winger-thumbnail_0.jpg"],
  },
  {
    name: "Tata Ace EV 1000",
    brand: "SCV",
    category: "Electric SCV",
    shortDescription: "Electric small commercial vehicle built for clean city deliveries and daily business use.",
    price: 995000,
    specifications: { Payload: "1000 kg", Fuel: "Electric", Range: "150 km" },
    files: ["9-by-12-EV-thumb_0.jpg", "ev12-thumb.jpg", "Ultra-EV_thumb.jpg"],
  },
  {
    name: "Tata Ace Pro",
    brand: "SCV",
    category: "Mini Truck",
    shortDescription: "Compact last-mile cargo vehicle with multiple body-angle images for showroom presentation.",
    price: 575000,
    specifications: { Payload: "750 kg", Fuel: "Diesel", Application: "Last-mile delivery" },
    files: ["3-4 1.webp", "3_4 1_1.webp", "3_4 2.webp", "3_4 3.webp", "3_4 7.webp", "3_4 8.webp", "3_4 9.webp", "3_4 front 1.webp", "Side 14.webp"],
  },
  {
    name: "Tata Intra V70 Gold",
    brand: "SCV",
    category: "Pickup",
    shortDescription: "Higher-payload pickup designed for rural and highway-linked goods movement.",
    price: 940000,
    specifications: { Payload: "1700 kg", Fuel: "Diesel", Engine: "1496 cc" },
    files: ["SUY06233_0.png", "lcpvmw-s.webp"],
  },
  {
    name: "TATA OK Certified Range",
    brand: "TATA OK",
    category: "Used",
    shortDescription: "Certified pre-owned commercial vehicles backed by a structured inspection process.",
    price: 1450000,
    specifications: { Inspection: "150 Point", Fuel: "Diesel", Type: "Certified Used CV" },
    files: ["tata-ok-banner.png.webp"],
  },
];

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

function copyProductImage(filename) {
  const sourcePath = path.join(sourceDir, filename);
  const targetPath = path.join(targetDir, filename);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source image: ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }

  return `/uploads/imported/products/${filename.replace(/\\/g, "/")}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const seedItem of productSeeds) {
    const { brand, category } = await ensureBrandAndCategory(seedItem.brand, seedItem.category);
    const imageUrls = seedItem.files.map(copyProductImage);
    const slug = makeSlug(seedItem.name);

    await Product.findOneAndUpdate(
      { slug },
      {
        name: seedItem.name,
        slug,
        brand_id: brand._id,
        category_id: category._id,
        short_description: seedItem.shortDescription,
        price: seedItem.price,
        featured_image: imageUrls[0] || null,
        gallery_images: imageUrls,
        specifications: seedItem.specifications,
        is_active: true,
        is_new_launch: true,
        is_bestseller: true,
        is_featured: true,
      },
      { upsert: true, new: true }
    );

    for (const imageUrl of imageUrls) {
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
              : "image/jpeg",
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`Seeded ${productSeeds.length} products from local images.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Product image seeding failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
