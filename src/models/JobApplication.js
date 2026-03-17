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

    // ✅ NEW FIELDS
    address: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    pincode: { type: String, trim: true },
    position: { type: String, trim: true },
    qualification: { type: String, trim: true },
    employmentStatus: { type: String, trim: true },
    expectedSalary: { type: Number }, // better as number

    resumeUrl: { type: String, required: true },

    whyShouldWeHire: { type: String, default: "" },

    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "rejected", "hired"],
      default: "new",
    },
  },
  { timestamps: true }
);

// Indexes (keep yours)
jobApplicationSchema.index({ jobId: 1, status: 1 });
jobApplicationSchema.index({ name: "text", email: "text" });

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;