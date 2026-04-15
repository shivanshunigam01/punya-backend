import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    primary_phone: String,
    secondary_phone: String,
    whatsapp_number: String,
    email: String,
    sales_phone_primary: String,
    sales_phone_secondary: String,
    sales_email: String,
    service_phone_primary: String,
    service_phone_secondary: String,
    service_email: String,
    md_desk_email: String,
    address: String,
    branch_sasaram_address: String,
    branch_bhojpur_address: String,
    working_hours: { type: String },
    company_overview: String,
    managing_director_name: String,
    managing_director_title: String,
    managing_director_bio: String,
    social_links: { type: Object, default: {} },
    default_seo_title: String,
    default_seo_description: String,
    features: { type: Object, default: {} },
    testimonial_section: { type: Object, default: {} },
    google_analytics_id: String,
    facebook_pixel_id: String,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);
