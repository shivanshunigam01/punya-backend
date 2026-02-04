import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    titleEn: {
      type: String,
      required: true,
      trim: true,
    },
    titleHi: {
      type: String,
      trim: true,
    },

    descriptionEn: {
      type: String,
      trim: true,
    },
    descriptionHi: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    applicableBrand: {
      type: String,
      default: "",
    },
    applicableCategory: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    priority: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
