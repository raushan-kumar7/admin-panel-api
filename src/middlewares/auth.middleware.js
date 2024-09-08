import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Middleware to verify JWT
export const verifyJWT = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.error("No token provided");
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // Verify the JWT token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user based on decoded token ID
    const user = await User.findByPk(decodedToken?.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.user = user;
    console.log("User's Role: ", user.role);
    next();
  } catch (error) {
    next(new ApiError(401, error?.message || "Invalid access token"));
  }
};

// Middleware to verify user roles
export const verifyUserRole = (roles) => {
  return (req, _, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied: Unauthorized request"));
    }
    next();
  };
};