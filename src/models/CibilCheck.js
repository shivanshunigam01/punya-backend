import mongoose from "mongoose";

const CibilCheckSchema = new mongoose.Schema(
  {
    customer_name: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    pan_masked: String,
    dob: String,
    cibil_score: Number,
    score_band: {
      type: String,
      enum: ["excellent", "good", "average", "poor", "unknown"],
      default: "unknown",
      index: true,
    },
    raw_response: { type: Object, default: {} },

    linked_lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    // 🔥 CHANGE THIS
    payment_id: {
      type: String, // Razorpay payment ID
      index: true,
    },

    checked_at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);


export const CibilCheck = mongoose.model("CibilCheck", CibilCheckSchema);
