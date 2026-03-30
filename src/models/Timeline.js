import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date: { type: Date, required: true },

    image_type: {
      type: String,
      enum: [
        'loan-mela', 'rural-activity', 'customer-meet', 'operator-meet',
        'exchange-mela', 'financer-meet', 'launch-event', 'road-show',
        'customer-testimony', 'customer-visit', 'group-event', 'others',
      ],
      default: 'others',
    },

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