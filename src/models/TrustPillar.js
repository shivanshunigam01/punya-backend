import mongoose from "mongoose";

const TrustPillarSchema = new mongoose.Schema(
  {
    icon: String,
    title: { type: String, required: true },
    description: String,
    link_text: String,
    link_url: String,
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const TrustPillar = mongoose.model("TrustPillar", TrustPillarSchema);
