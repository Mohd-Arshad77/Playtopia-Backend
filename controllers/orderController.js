import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";

export const checkout = async (req, res, next) => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    const address = await Address.findOne({ _id: addressId, userId: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
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
        $project: {
          product: "$product._id",
          qty: "$items.qty",
          stock: "$product.stock",
          priceAtPurchase: "$product.price",
          lineTotal: { $multiply: ["$items.qty", "$product.price"] }
        }
      },
      {
        $group: {
          _id: null,
          items: {
            $push: {
              product: "$product",
              qty: "$qty",
              stock: "$stock",
              priceAtPurchase: "$priceAtPurchase"
            }
          },
          totalBill: { $sum: "$lineTotal" }
        }
      }
    ]);

    if (!cartAgg.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const { items, totalBill } = cartAgg[0];

    for (const item of items) {
      if (item.qty > item.stock) {
        return res.status(400).json({ 
          success: false, 
          message: `Some items are out of stock. Please update your cart.` 
        });
      }
    }

    const order = await Order.create({
      user: req.user.id,
      items, 
      total: totalBill, 
      shippingAddress: {
        fullName: address.fullName,
        mobile: address.mobile,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      payment: {
        method: "COD",
        status: "pending"
      }
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { 
        $inc: { stock: -item.qty } 
      });
    }

    await Cart.deleteOne({ user: req.user.id });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { orderId: order._id }
    });

  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) { next(err); }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) { next(err); }
};
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    
    let updateData = { status };
    if (status === "delivered") {
      updateData["payment.status"] = "paid";
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json({ success: true, message: "Order updated", data: order });
  } catch (err) { next(err); }
};