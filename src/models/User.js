import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },


    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },


    mobile: {
      type: String,
      required: true,
      trim: true,
    },


    password: {
      type: String,
      required: true,
      select: false,
    },


    role: {
      type: String,
      enum: ["master_admin", "admin", "sales_user", "custom"],
      default: "sales_user",
    },


    isActive: {
      type: Boolean,
      default: true,
    },


    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// Compare password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};


export default mongoose.model("User", userSchema);