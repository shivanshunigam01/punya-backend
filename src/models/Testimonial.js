import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    customer_name: { type: String, required: true },
    customer_title: String,
    customer_photo: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    review_text: { type: String, required: true },
    product_purchased: String,
    is_featured: { type: Boolean, default: false, index: true },
    is_active: { type: Boolean, default: true, index: true },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
