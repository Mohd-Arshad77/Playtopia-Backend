import express from "express";
import { 
  addToCart, 
  getCart, 
  removeFromCart, 
  increaseQty, 
  decreaseQty 
} from "../controllers/cartController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getCart);

router.post("/add", addToCart);

router.post("/increase", increaseQty);
router.post("/decrease", decreaseQty);

router.delete("/remove/:productId", removeFromCart);

export default router;