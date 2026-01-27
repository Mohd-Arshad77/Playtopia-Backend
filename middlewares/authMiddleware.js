import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

const auth = async (req, res, next) => {
  let token = null;

  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired"
    });
  }
};

export default auth;