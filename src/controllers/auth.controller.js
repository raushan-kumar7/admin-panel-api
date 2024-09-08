import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createUserSchema,
  loginUserSchema,
} from "../validation/user.validation.js";
import User from "../models/user.model.js";
import { sequelize, Op } from "../db/index.js";
import { logAction } from "../utils/logAction.js";

/**
 * Utility function to generate access and refresh tokens
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while generating access and refresh tokens"
    );
  }
};

/**
 * @route POST /api/v1/auth/signup
 * @desc Register a new Admin
 * @access Public
 */
const registerAdmin = async (req, res) => {
  //await sequelize.sync({ alter: true });

  const { error } = createUserSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { username, email, password, role } = req.body;

  // Ensure that only 'Admin' can be registered via this route
  if (role !== "Admin") {
    throw new ApiError(
      403,
      "Only 'Admin' role can be registered via this route"
    );
  }

  // Check if the user with this email already exists
  const existingAdmin = await User.findOne({ where: { email } });
  if (existingAdmin) {
    throw new ApiError(400, "User with this email already exists");
  }

  const admin = await User.create({
    username,
    email,
    password,
    role,
  });

  if (!admin) {
    throw new ApiError(500, "An error occurred while registering the user");
  }

  const adminData = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };

  await logAction("REGISTER_ADMIN", admin.id, admin.id);

  return res
    .status(201)
    .json(new ApiResponse(201, adminData, "User registered successfully"));
};

/**
 * @route POST /api/v1/auth/signin
 * @desc Login a user
 * @access Public
 */
const loginUser = async (req, res) => {
  const { error } = loginUserSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { usernameOrEmail, password } = req.body;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Await the tokens to ensure they are properly returned
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id
  );

  const loggedInUser = await User.findByPk(user.id, {
    attributes: { exclude: ["password", "refreshToken"] },
  });

  const options = { httpOnly: true, secure: true };

  await logAction("SIGNIN_USER", user.id, user.id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
};

/**
 * @route POST /api/v1/auth/signout
 * @desc Logout a user
 * @access Private
 */
const logoutUser = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Clear the refresh token in the database
  user.refreshToken = null;
  await user.save();

  const options = { httpOnly: true, secure: true };

  await logAction("SIGNOUT_USER", req.user.id, user.id);

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
};

export { registerAdmin, loginUser, logoutUser };
