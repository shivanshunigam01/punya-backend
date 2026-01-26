import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: String,
    description: String,
    logo_url: String,
    hero_image: String,
    accent_color: String,
    is_active: { type: Boolean, default: true, index: true },
    display_order: { type: Number, default: 0 },
    seo_title: String,
    seo_description: String,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Brand = mongoose.model("Brand", BrandSchema);
