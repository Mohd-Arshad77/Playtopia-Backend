import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getWishlist,
  toggleWishlist
} from "../controllers/wishlistController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);

export default router;