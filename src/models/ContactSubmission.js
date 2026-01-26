import mongoose from "mongoose";

const ContactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    mobile: { type: String, required: true },
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "replied", "closed"], default: "new", index: true },
    replied_at: Date,
    reply_message: String,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const ContactSubmission = mongoose.model("ContactSubmission", ContactSubmissionSchema);
