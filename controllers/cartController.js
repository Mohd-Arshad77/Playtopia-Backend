import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const sendCartResponse = async (res, cartDoc) => {
  const cart = await cartDoc.populate("items.product", "name price image stock");
  res.status(200).json({
    success: true,
    message: "Cart updated",
    data: cart ? cart.items : [],
  });
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price image stock");
    res.status(200).json({
      success: true,
      message: "Cart fetched",
      data: cart ? cart.items : [],
    });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1 } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId).select("stock");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (qty > product.stock) {
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, qty }],
      });
    } else {
      const itemExists = await Cart.findOne({
        user: userId,
        "items.product": productId,
      });

      if (itemExists) {
        cart = await Cart.findOneAndUpdate(
          { user: userId, "items.product": productId },
          { $inc: { "items.$.qty": qty } },
          { new: true }
        );
      } else {
        cart = await Cart.findOneAndUpdate(
          { user: userId },
          { $push: { items: { product: productId, qty } } },
          { new: true }
        );
      }
    }

    await sendCartResponse(res, cart);
  } catch (err) {
    next(err);
  }
};

export const increaseQty = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId).select("stock");
    const cartItem = await Cart.findOne(
      { user: userId, "items.product": productId },
      { "items.$": 1 }
    );

    if (!cartItem) return res.status(404).json({ success: false, message: "Item not in cart" });

    const currentQty = cartItem.items[0].qty;

    if (currentQty + 1 > product.stock) {
      return res.status(400).json({ success: false, message: `Stock limit reached! Only ${product.stock} available.` });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $inc: { "items.$.qty": 1 } },
      { new: true }
    );

    await sendCartResponse(res, cart);
  } catch (err) {
    next(err);
  }
};

export const decreaseQty = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const cartItem = await Cart.findOne(
      { user: userId, "items.product": productId },
      { "items.$": 1 }
    );

    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });

    const currentQty = cartItem.items[0].qty;
    let cart;

    if (currentQty > 1) {
      cart = await Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        { $inc: { "items.$.qty": -1 } },
        { new: true }
      );
    } else {
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: productId } } },
        { new: true }
      );
    }

    await sendCartResponse(res, cart);
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: { product: productId } } },
      { new: true }
    );

    await sendCartResponse(res, cart);
  } catch (err) {
    next(err);
  }
};