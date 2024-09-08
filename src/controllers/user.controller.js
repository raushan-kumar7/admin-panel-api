import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createUserSchema } from "../validation/user.validation.js";
import User from "../models/user.model.js";
import { sequelize, Op } from "../db/index.js";
import { logAction } from "../utils/logAction.js";

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Only admin can register the users
 */
const registerUser = async (req, res) => {
  await sequelize.sync({ alter: true });

  // Validate request data using Joi
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { username, email, password, role } = req.body;

  if (role === "Admin") {
    throw new ApiError(403, "Admin can't be registered through this route");
  }

  // Check if the user with this email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
  });

  if (!user) {
    throw new ApiError(500, "An error occurred while registering the user");
  }

  const userData = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await logAction("REGISTER_USER", req.user.id, user.id);

  return res
    .status(201)
    .json(new ApiResponse(201, userData, "User registered successfully"));
};

/**
 * @route GET /api/v1/users
 * @desc Get all users
 * @access Only admin and managers can access this route
 */
const getAllUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password", "refreshToken", "deletedAt"] },
    where: {
      deletedAt: null,
    },
  });

  if (!users || users.length === 0) {
    throw new ApiError(404, "Users not found");
  }

  await logAction("FETCH_ALL_USERS", req.user.id, users[0].id);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users found successfully"));
};

/**
 * @route GET /api/v1/users/:userId
 * @desc Get user by ID
 * @access All users can access this route
 */
const getUserByUserId = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password", "refreshToken", "deletedAt"] },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await logAction("FETCH_USER_BY_ID", req.user.id, user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
};

/**
 * @route GET /api/v1/users/current-user
 * @desc Get current user
 * @access All users can access this route
 */
const getCurrentUser = async (req, res) => {
  await logAction("FETCH_CURRENT_USER", req.user.id, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user found successfully"));
};

/**
 * @route PUT /api/v1/users/:userId
 * @desc Update user details
 * @access Only admin can update user details
 */
const updateUserDetails = async (req, res) => {
  const { userId } = req.params;
  const { username, email, role } = req.body;

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.username = username || user.username;
  user.email = email || user.email;
  user.role = role || user.role;

  await user.save();

  await logAction("UPDATE_USER_DETAILS", req.user.id, user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
};

/**
 * @route DELETE /api/v1/users/:userId
 * @desc Soft delete user
 * @access Only admin can delete user
 */
const softDeleteUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.destroy();
  await logAction("SOFT_DELETE_USER", req.user.id, user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User soft deleted successfully"));
};

/**
 * @route DELETE /api/v1/users/permanent/:userId
 * @desc Permanent delete user
 * @access Only admin can permanently delete user
 */
const permanentDeleteUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId, { paranoid: false }); // Get user including soft-deleted ones

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.destroy({ force: true });

  await logAction("PERMANENT_DELETE_USER", req.user.id, user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User permanently deleted successfully"));
};

/**
 * @route PATCH /api/v1/users/restore/:userId
 * @desc Restore soft deleted user
 * @access Only admin can restore user
 */
const restoreUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId, {
    paranoid: false,
    attributes: { exclude: ["password", "refreshToken"] },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.restore();

  await logAction("RESTORE_USER_DETAILS", req.user.id, user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User restored successfully"));
};

export {
  registerUser,
  getAllUsers,
  getUserByUserId,
  getCurrentUser,
  updateUserDetails,
  softDeleteUser,
  permanentDeleteUser,
  restoreUser,
};
