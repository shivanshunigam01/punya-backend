import mongoose from "mongoose";

const NewArrivalSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    display_order: { type: Number, default: 0 },
    expires_at: { type: Date },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const NewArrival = mongoose.model("NewArrival", NewArrivalSchema);
