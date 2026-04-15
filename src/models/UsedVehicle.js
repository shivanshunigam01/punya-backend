import mongoose from "mongoose";

const ConditionReportSchema = new mongoose.Schema(
  {
    engine: { type: String, enum: ["excellent", "good", "fair", "poor"], default: "good" },
    transmission: { type: String, enum: ["excellent", "good", "fair", "poor"], default: "good" },
    body: { type: String, enum: ["excellent", "good", "fair", "poor"], default: "good" },
    tyres_life_percent: { type: Number, min: 0, max: 100, default: 70 },
    interior: { type: String, enum: ["excellent", "good", "fair", "poor"] },
    notes: String,
  },
  { _id: false }
);

const UsedVehicleSchema = new mongoose.Schema(
  {
    vehicle_type: { type: String, enum: ["tipper", "bus", "loader", "machine", "pickup", "lcv", "trailer", "other"], required: false, index: true },
    brand: String,
    model: { type: String, required: true },
    year: { type: Number, required: true },
    kilometers: Number,
    hours: Number,
    price: { type: Number, required: true, min: 0 },
    price_display: String,
    emi_estimate: Number,
    featured_image: String,
    gallery_images: { type: [String], default: [] },
    fuel_type: String,
    ownership: String,
    insurance_valid_till: Date,
    fitness_valid_till: Date,
    rc_status: String,
    condition_report: { type: ConditionReportSchema, default: {} },
    is_certified: { type: Boolean, default: false, index: true },
    inspection_report_url: String,
    has_warranty: { type: Boolean, default: false },
    warranty_details: String,
    has_return_policy: { type: Boolean, default: false },
    return_policy_days: Number,
    finance_available: { type: Boolean, default: true },
    location: String,
    status: { type: String, enum: ["available", "reserved", "sold"], default: "available", index: true },
    is_active: { type: Boolean, default: true, index: true },
    seller_name: String,
    seller_phone: String,
    listed_at: { type: Date, default: Date.now },
    sold_at: Date,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const UsedVehicle = mongoose.model("UsedVehicle", UsedVehicleSchema);
