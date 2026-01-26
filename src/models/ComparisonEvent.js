import mongoose from "mongoose";

const ComparisonEventSchema = new mongoose.Schema(
  {
    product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }],
    product_names: { type: [String], default: [] },
    user_session_id: String,
    ip_address: String,
    device_type: { type: String, enum: ["mobile", "tablet", "desktop"], default: "mobile" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const ComparisonEvent = mongoose.model("ComparisonEvent", ComparisonEventSchema);
