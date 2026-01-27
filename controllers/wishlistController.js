import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const getWishlistData = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId }).populate("products");
  return wishlist ? wishlist.products : [];
};

export const getWishlist = async (req, res, next) => {
  try {
    const products = await getWishlistData(req.user.id);
    
    res.status(200).json({
      success: true,
      message: "Wishlist fetched",
      data: products
    });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const isValidProduct = await Product.exists({ _id: productId });
    if (!isValidProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const wishlist = await Wishlist.findOne({ user: userId, products: productId });

    let message;
    let updatedList;

    if (wishlist) {
      updatedList = await Wishlist.findOneAndUpdate(
        { user: userId },
        { $pull: { products: productId } },
        { new: true }
      ).populate("products");
      message = "Removed from wishlist";
    } else {
      updatedList = await Wishlist.findOneAndUpdate(
        { user: userId },
        { $addToSet: { products: productId } },
        { new: true, upsert: true }
      ).populate("products");
      message = "Added to wishlist";
    }

    res.status(200).json({
      success: true,
      message,
      data: updatedList.products
    });
  } catch (err) {
    next(err);
  }
};