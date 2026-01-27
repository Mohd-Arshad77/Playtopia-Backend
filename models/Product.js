import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    description: String,
    stock: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
