import mongoose from "mongoose";

const VisitLogSchema = new mongoose.Schema(
  {
    ip_address: String,
    user_agent: String,
    path: String,
  },
  { timestamps: { createdAt: "created_at" } }
);

export default mongoose.model("VisitLog", VisitLogSchema);
