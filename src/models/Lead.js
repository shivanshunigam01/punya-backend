import mongoose from "mongoose";

const LeadNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User",  default: null },
    created_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadSchema = new mongoose.Schema(
  {
    lead_number: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true, index: true },
    source_page: String,
    source_product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    source_product_name: String,
    customer_name: { type: String, required: true },
    customer_mobile: { type: String, required: true, index: true },
    customer_email: String,
    customer_district: String,
    customer_address: String,
    brand_interest: String,
    product_interest: String,
    vehicle_type_interest: String,
    budget_range: String,
    status: { type: String, default: "new", index: true },
    priority: { type: String, default: "medium", index: true },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assigned_at: Date,
    notes: { type: [LeadNoteSchema], default: [] },
    last_contacted_at: Date,
    next_followup_at: Date,
    converted_at: Date,
    conversion_value: Number,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    client_meta: {
      ip: String,
      userAgent: String,
      referrer: String,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Lead = mongoose.model("Lead", LeadSchema);
