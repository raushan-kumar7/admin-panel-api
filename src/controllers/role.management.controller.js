import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { roleSchema } from "../validation/user.validation.js";
import User from "../models/user.model.js";
import { logAction } from "../utils/logAction.js";

/**
 * @route POST /api/v1/users/:userId/assign-role
 * @desc Assign a role to a user
 * @access Only admin can assign roles
 */
const assignRole = async (req, res) => {
  const { userId } = req.params;
  const { error } = roleSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  const { role } = req.body;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refreshToken'] }
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;
  await user.save();

  await logAction("ASSIGN_ROLE", req.user.id, user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, `Role assigned successfully as ${role}`));
};

/**
 * @route POST /api/v1/users/:userId/revoke-role
 * @desc Revoke a role from a user
 * @access Only admin can revoke roles
 */
const revokeRole = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refreshToken'] } 
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // After revoking the user role is set to Employee, because role datatype is enum
  user.role = "Employee";
  await user.save();

  await logAction("REVOKE_ROLE", req.user.id, user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Role revoked and set to Employee"));
};

export { assignRole, revokeRole };
