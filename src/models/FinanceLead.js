import mongoose from "mongoose";

const FinanceLeadSchema = new mongoose.Schema(
  {
    vehicle_type: { type: String, required: true },
    business_type: { type: String, required: true },
    customer_name: { type: String, required: true },
    mobile: {
      type: String,
      required: true,
      index: true,
      match: /^\d{10}$/,
    },
    district: { type: String, required: true },
    source: { type: String, default: "Finance Page" },

    status: {
      type: String,
      enum: ["new", "contacted", "approved", "rejected"],
      default: "new",
      index: true,
    },

    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FinanceLead = mongoose.model("FinanceLead", FinanceLeadSchema);
