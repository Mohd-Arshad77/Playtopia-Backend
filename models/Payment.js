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
    // Razorpay മാറ്റി Stripe ആക്കി
    enum: ["COD", "Stripe", "Online"], 
    default: "Stripe"
  },
  // Razorpay fields ഒഴിവാക്കി, പകരം ഒറ്റ ID മതി
  transactionId: { type: String }

}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);