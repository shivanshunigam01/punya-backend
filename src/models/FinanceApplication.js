import mongoose from "mongoose";

const FinanceApplicationSchema = new mongoose.Schema(
  {
    application_number: { type: String, required: true, unique: true, index: true },
    vehicle_type: String,
    business_type: String,
    approximate_budget: Number,
    applicant_name: { type: String, required: true },
    applicant_mobile: { type: String, required: true, index: true },
    applicant_district: String,
    status: { type: String, enum: ["pending", "under_review", "approved", "rejected", "disbursed"], default: "pending", index: true },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    documents_received: { type: Boolean, default: false },
    documents_list: { type: [String], default: [] },
    internal_notes: String,
    submitted_at: { type: Date, default: Date.now },
    reviewed_at: Date,
    approved_at: Date,
    linked_lead_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    linked_product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const FinanceApplication = mongoose.model("FinanceApplication", FinanceApplicationSchema);
