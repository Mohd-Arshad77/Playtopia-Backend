import User from "../models/User.js";

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);


    if (user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admins only." 
      });
    }

    next(); 
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default admin;