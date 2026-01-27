import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"], 
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Razorpay", "mock"], 
    default: "Razorpay"
  },
  
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String }

}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);