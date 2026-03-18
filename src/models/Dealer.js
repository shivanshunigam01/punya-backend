import mongoose from "mongoose";

const dealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },

    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String },
    brand: {
  type: String,
  enum: ["JCB", "Ashok Leyland", "Switch EV"],
  required: true,
},


    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Dealer = mongoose.model("Dealer", dealerSchema);
