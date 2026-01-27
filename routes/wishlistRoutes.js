import express from "express";
import auth from "../middlewares/authMiddleware.js";
import {
  getWishlist,
  toggleWishlist
} from "../controllers/wishlistController.js";

const router = express.Router();

router.use(auth);
router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);

export default router;
