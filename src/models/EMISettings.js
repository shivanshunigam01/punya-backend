import mongoose from "mongoose";

const EMISettingsSchema = new mongoose.Schema(
  {
    interest_rate: { type: Number, required: true },
    min_vehicle_price: Number,
    max_vehicle_price: Number,
    min_down_payment: Number,
    max_down_payment: Number,
    min_tenure_months: Number,
    max_tenure_months: Number,
    default_vehicle_price: Number,
    default_down_payment: Number,
    default_tenure: Number,
    disclaimer_text: String,
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const EMISettings = mongoose.model("EMISettings", EMISettingsSchema);
