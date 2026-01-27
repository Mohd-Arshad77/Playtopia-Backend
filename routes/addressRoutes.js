import express from "express";
import { 
  addAddress, 
  getAddresses, 
  setDefaultAddress, 
  deleteAddress 
} from "../controllers/addressController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(auth);

router.post("/add", addAddress); 

router.get("/", getAddresses);             

router.put("/:id/default", setDefaultAddress); 
router.delete("/:id", deleteAddress);     

export default router;