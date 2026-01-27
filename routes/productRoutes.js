import express from "express";
import { upload } from "../middlewares/upload.js";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProductPut,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

router.post("/", upload.single("image"), createProduct);
router.put("/:id", updateProductPut);
router.delete("/:id", deleteProduct);

export default router;
