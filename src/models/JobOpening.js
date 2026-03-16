import mongoose from "mongoose";

const jobOpeningSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract", "Internship"],
      default: "Full Time",
    },
    description: { type: String, required: true },
    qualifications: [{ type: String }],
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobOpeningSchema.index({ title: "text", location: "text" });

const JobOpening = mongoose.model("JobOpening", jobOpeningSchema);

export default JobOpening;