import { Router } from "express";
import {
  getAllUsers,
  getCurrentUser,
  getUserByUserId,
  permanentDeleteUser,
  restoreUser,
  softDeleteUser,
  updateUserDetails,
} from "../controllers/user.controller.js";
import {
  assignRole,
  revokeRole,
} from "../controllers/role.management.controller.js";
import { verifyJWT, verifyUserRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/current-user").get(getCurrentUser);

// Admin: manage users (assign roles, revoke roles, update, delete, restore)
router
  .route("/:userId")
  .get(verifyUserRole(["Admin"]), getUserByUserId) 
  .put(verifyUserRole(["Admin"]), updateUserDetails)
  .delete(verifyUserRole(["Admin"]), softDeleteUser);

router.route("/permanent/:userId").delete(verifyUserRole(["Admin"]), permanentDeleteUser);
router.route("/restore/:userId").patch(verifyUserRole(["Admin"]), restoreUser);
router.route("/:userId/assign-role").post(verifyUserRole(["Admin"]), assignRole);
router.route("/:userId/revoke-role").post(verifyUserRole(["Admin"]), revokeRole);

// Routes for Admin and Manager roles
router.route("/").get(verifyUserRole(["Admin", "Manager"]), getAllUsers);


export default router;
