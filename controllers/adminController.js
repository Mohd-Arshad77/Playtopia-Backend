import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getAdminStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: "user" });
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();

    const totalRevenue = await Order.aggregate([
      { 
        $match: { 
          "payment.status": "paid",
          status: { $ne: "cancelled" }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$total" } 
        } 
      }
    ]);

    res.json({
      success: true,
      data: {
        usersCount,
        ordersCount,
        productsCount,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? "User has been blocked" : "User has been unblocked",
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
