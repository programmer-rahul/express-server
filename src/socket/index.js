import cookie from "cookie";
import jwt from "jsonwebtoken";

import ApiError from "../utils/ApiError.js";
import UserModel from "../models/user.model.js";
import { SocketEventEnum } from "../constants.js";

const mountSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

      let accessToken = cookies?.access_token;

      if (!accessToken) {
        accessToken = socket.handshake.auth?.accessToken;
      }

      if (!accessToken) {
        throw new ApiError(
          401,
          "Unauthorized request , token is not available"
        );
      }

      const decodedAccessToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );

      const user = await UserModel.findById(decodedAccessToken._id).select(
        "_password -refreshToken"
      );

      if (!user) {
        throw new ApiError(401, "Unauthorized request, invalid access token");
      }

      socket.user = user;

      socket.join(user._id.toString());
      socket.emit(SocketEventEnum.USER_CONNECTED);

      console.log("A user connected to server :- ", user._id.toString());

      socket.on(SocketEventEnum.USER_DISCONNECTED, () => {
        socket.leave(user._id.toString());

        console.log("A user disconnected from server :-", user._id.toString());
      });
    } catch (error) {
      console.log("Something went wrong during socket connection", error);
      socket.emit(
        SocketEventEnum.SOCKET_ERROR,
        error?.message || "Something went wrong during socket connection"
      );
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};

export { mountSocketIO, emitSocketEvent };
