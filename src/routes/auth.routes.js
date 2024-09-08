import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerAdmin,
} from "../controllers/auth.controller.js";
import { registerUser } from "../controllers/user.controller.js";
import { verifyJWT, verifyUserRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(registerAdmin);
router.route("/signin").post(loginUser);

router.use(verifyJWT);

// Only Admin users can access the register route
router.route("/register").post(verifyUserRole(["Admin"]), registerUser);

router.route("/signout").post(logoutUser);

export default router;
