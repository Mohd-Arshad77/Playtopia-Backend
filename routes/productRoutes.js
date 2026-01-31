import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductPut,
  deleteProduct,
} from "../controllers/productController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.post(
  "/",
  verifyToken,
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  verifyToken,
  upload.single("image"),
  updateProductPut
);

router.delete("/:id", verifyToken, deleteProduct);

export default router;