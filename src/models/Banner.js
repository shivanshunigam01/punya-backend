import mongoose from "mongoose";

const CTAButtonSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ["primary", "secondary", "outline"], default: "primary" },
    action: { type: String, enum: ["call", "whatsapp", "enquiry", "link"], default: "link" },
    link: String,
    phone: String,
    icon: String,
  },
  { _id: true }
);

const BannerSchema = new mongoose.Schema(
  {
    page: { type: String, enum: ["home", "jcb", "ashok_leyland", "switch_ev", "used_vehicles", "finance"], required: true, index: true },
    title: { type: String, required: true },
    subtitle: String,
    background_image: String,
    background_video: String,
    overlay_opacity: { type: Number, default: 40, min: 0, max: 100 },
    cta_buttons: { type: [CTAButtonSchema], default: [] },
    trust_badges: { type: [String], default: [] },
    customer_count: Number,
    is_active: { type: Boolean, default: true, index: true },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Banner = mongoose.model("Banner", BannerSchema);
