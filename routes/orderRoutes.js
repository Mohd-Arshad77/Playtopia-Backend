import express from "express";
import { 
  checkout,        
  getMyOrders, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus 
} from "../controllers/orderController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(auth); 

router.post("/", checkout); 

router.get("/myorders", getMyOrders);
router.get("/:id", getOrderById);
router.get("/admin/all", getAllOrders);
router.put("/admin/:id", updateOrderStatus);

export default router;