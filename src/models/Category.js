import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    icon: String,
    image: String,
    is_active: { type: Boolean, default: true, index: true },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

CategorySchema.index({ brand_id: 1, slug: 1 }, { unique: true });

export const Category = mongoose.model("Category", CategorySchema);
