import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    year: Number,

    image: String,
    public_id: String,

    is_active: {
      type: Boolean,
      default: true,
    },

    display_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Timeline = mongoose.model("Timeline", timelineSchema);

export default Timeline;   // ✅ IMPORTANT