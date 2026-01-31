import Stripe from "stripe";
import dotenv from "dotenv";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = req.user.id;

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,
          images: [item.product.image],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      metadata: {
        userId: userId.toString(),
        addressId: addressId,
      },
    });

    res.status(200).json({
      success: true,
      id: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe Session Error:", err);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not verified" });
    }

    const { userId, addressId } = session.metadata;

    const existingOrder = await Order.findOne({ "payment.transactionId": session.id });
    if (existingOrder) {
      return res.status(200).json({ success: true, message: "Order already placed", orderId: existingOrder._id });
    }

    const addressDoc = await Address.findOne({ _id: addressId, userId: userId });
    if (!addressDoc) return res.status(400).json({ message: "Invalid Address" });

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.status(400).json({ message: "Cart not found" });

    const totalAmount = cart.items.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      qty: item.qty,
      priceAtPurchase: item.product.price,
      image: item.product.image,
    }));

    const newOrder = await Order.create({
      user: userId,
      items: orderItems,
      total: totalAmount,
      shippingAddress: {
        fullName: addressDoc.fullName,
        mobile: addressDoc.mobile,
        street: addressDoc.street,
        city: addressDoc.city,
        state: addressDoc.state,
        zipCode: addressDoc.zipCode,
      },
      payment: {
        method: "Online",
        status: "paid",
        transactionId: session.id,
      },
      status: "created",
    });

    await Payment.create({
      orderId: newOrder._id,
      userId: userId,
      amount: totalAmount,
      currency: "INR",
      status: "success",
      paymentMethod: "Stripe",
      transactionId: session.id,
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.qty } });
    }

    await Cart.deleteOne({ user: userId });

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};