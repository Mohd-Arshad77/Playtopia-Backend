import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false } 
}, { timestamps: true });

export default mongoose.model("Address", AddressSchema);