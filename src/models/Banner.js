import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      enum: [
        "home",
        "trucks",
        "buses_vans",
        "switch_ev",
        "used_vehicles",
        "finance",
      ],
      required: true,
    },

    title: { type: String, required: true },
    subtitle: { type: String },

    // ✅ VERY IMPORTANT
    background_image: { type: String },
    background_video: { type: String },

    overlay_opacity: { type: Number, default: 40 },

    trust_badges: [{ type: String }],
    customer_count: { type: Number },

    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const Banner = mongoose.model("Banner", BannerSchema);
