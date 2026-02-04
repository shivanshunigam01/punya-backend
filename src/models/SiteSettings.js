import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    primary_phone: String,
    whatsapp_number: String,
    email: String,
    address: String,
    working_hours: { type: String },
    social_links: { type: Object, default: {} },
    default_seo_title: String,
    default_seo_description: String,
    features: { type: Object, default: {} },
    google_analytics_id: String,
    facebook_pixel_id: String,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);
