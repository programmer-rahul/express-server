import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/user.controller.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/user.validator.js";
import validate from "../validators/index.js";

const userRouter = Router();

userRouter
  .route("/register")
  .post(userRegisterValidator(), validate, registerUser);
userRouter.route("/login").post(userLoginValidator(), validate, loginUser);
userRouter.route("/refresh-token").post(refreshAccessToken);

// protected routes
userRouter.use(auth);

userRouter.route("/logout").post(logoutUser);

export default userRouter;
