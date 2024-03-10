import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import UserModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { COOKIE_OPTIONS } from "../constants.js";
import { encryptUserPassword } from "../utils/helper.js";

const generateJWTTokens = async (userId) => {
  try {
    const user = await UserModel.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong during generating jwt tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const isUserExist = await UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExist) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const encryptedPassword = await encryptUserPassword(password);

  const user = await UserModel.create({
    username,
    email,
    password: encryptedPassword,
  });

  const createdUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      user: createdUser,
    })
  );
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordValid(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateJWTTokens(user._id);

  const loggedInUser = await UserModel.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, { ...COOKIE_OPTIONS })
    .cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS })
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", { ...COOKIE_OPTIONS })
    .clearCookie("refreshToken", { ...COOKIE_OPTIONS })
    .json(new ApiResponse(200, "User logout successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const userRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshAccessToken;

  console.log(userRefreshToken);

  if (!userRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedRefreshToken = await jwt.verify(
      userRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await UserModel.findById(decodedRefreshToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== userRefreshToken) {
      throw new ApiError(401, "Refresh token is invalid or expired");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateJWTTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, { ...COOKIE_OPTIONS })
      .cookie("refreshToken", newRefreshToken, { ...COOKIE_OPTIONS })
      .json(
        new ApiResponse(200, "Token refreshed successfully", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
