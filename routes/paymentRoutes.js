import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { initiatePayment, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.use(auth);

router.post("/create-order", initiatePayment);
router.post("/verify", verifyPayment);

export default router;
