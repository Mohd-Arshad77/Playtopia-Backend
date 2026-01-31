import express from "express";
import { createCheckoutSession, verifyPayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post("/verify-session", verifyToken, verifyPayment);

export default router;