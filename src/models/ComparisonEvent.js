import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    product_names: [String],
    user_session_id: String,
    device_type: String,
    ip_address: String,
  },
  { timestamps: true }
);

export default mongoose.model("ComparisonEvent", schema);
