import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const initiatePayment = async (req, res) => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId: req.user.id
    });

    if (!address) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const cartAgg = await Cart.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: null,
          totalBill: {
            $sum: { $multiply: ["$items.qty", "$product.price"] }
          }
        }
      }
    ]);

    if (!cartAgg.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const amount = cartAgg[0].totalBill * 100; // Convert to paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    res.status(200).json({
      success: true,
      message: "Payment order created",
      data: {
        razorpayOrder: order,
        addressId 
      }
    });

  } catch (err) {
    console.error("Initiate Error:", err);
    
    res.status(500).json({ 
      success: false, 
      message: "Payment initiation failed",
      error: err.message
    }); 
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      addressId 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Payment Signature" });
    }

    const userId = req.user.id;

    const addressDoc = await Address.findOne({ _id: addressId, userId: userId });
    if (!addressDoc) return res.status(400).json({ message: "Invalid Address" });

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.status(400).json({ message: "Cart not found" });

    const totalAmount = cart.items.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

    const newOrder = await Order.create({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        qty: item.qty,
        price: item.product.price
      })),
      total: totalAmount,
      shippingAddress: addressDoc,
      payment: {
        method: "Razorpay",
        status: "success",
        transactionId: razorpay_payment_id
      }
    });

    await Payment.create({
      orderId: newOrder._id,
      userId: userId,
      amount: totalAmount,
      currency: "INR",
      status: "success",
      paymentMethod: "Razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.qty }
      });
    }

    await Cart.deleteOne({ user: userId });

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id
    });

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};