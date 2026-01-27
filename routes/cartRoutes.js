import express from "express";
import {
  getCart,
  addToCart,
  decreaseQty,
  increaseQty,
  removeItem
} from "../controllers/cartController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();


router.use(auth);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/decrease", decreaseQty);
router.post("/increase", increaseQty);
router.delete("/remove/:productId", removeItem);

export default router;
