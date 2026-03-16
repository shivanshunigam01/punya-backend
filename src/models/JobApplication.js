import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOpening",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    resumeUrl: { type: String, required: true }, // Cloudinary URL or file server URL
    whyShouldWeHire: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "rejected", "hired"],
      default: "new",
    },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ jobId: 1, status: 1 });
jobApplicationSchema.index({ name: "text", email: "text" });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;