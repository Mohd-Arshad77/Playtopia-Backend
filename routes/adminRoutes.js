import express from "express";
import auth from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";
import { upload } from "../middlewares/upload.js";

import {
  createProduct,
  updateProductPut,
  updateProductPatch,
  deleteProduct
} from "../controllers/productController.js";

import {
  getAdminStats,
  getAllUsers,
  getUserById,
  toggleBlockUser
} from "../controllers/adminController.js";

import {
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

router.use(auth, admin);

router.get("/stats", getAdminStats);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/block", toggleBlockUser);

router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);

router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProductPut);
router.patch("/products/:id", updateProductPatch);
router.delete("/products/:id", deleteProduct);

export default router;
