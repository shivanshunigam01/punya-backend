import mongoose from "mongoose";
import dotenv from "dotenv";
import ContentPage from "../models/contentPage.model.js";

dotenv.config();

const pages = [
  {
    key: "about-us",
    titleEn: "About Us",
    titleHi: "हमारे बारे में",
    contentEn: "",
    contentHi: "",
  },
  {
    key: "service-warranty",
    titleEn: "Service & Warranty",
    titleHi: "सेवा और वारंटी",
    contentEn: "",
    contentHi: "",
  },
  {
    key: "parts-lubricants",
    titleEn: "Parts & Lubricants",
    titleHi: "पार्ट्स और लुब्रिकेंट्स",
    contentEn: "",
    contentHi: "",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const page of pages) {
      await ContentPage.updateOne(
        { key: page.key },
        { $setOnInsert: page },
        { upsert: true }
      );
    }

    console.log("✅ Content pages seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
