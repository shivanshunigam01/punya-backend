import mongoose from "mongoose";

const CustomSpecSchema = new mongoose.Schema({ label: String, value: String }, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    short_description: String,
    full_description: String,
    price: { type: Number, min: 0 },
    price_display: String,
    featured_image: String,
    gallery_images: { type: [String], default: [] },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    key_features: { type: [String], default: [] },
    applications: { type: [String], default: [] },
    is_active: { type: Boolean, default: true, index: true },
    is_new_launch: { type: Boolean, default: false, index: true },
    is_bestseller: { type: Boolean, default: false, index: true },
    is_featured: { type: Boolean, default: false, index: true },
    in_stock: { type: Boolean, default: true },
    seo_title: String,
    seo_description: String,
    seo_keywords: { type: [String], default: [] },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Product = mongoose.model("Product", ProductSchema);
