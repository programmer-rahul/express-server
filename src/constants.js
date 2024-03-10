const DB_NAME = "testing";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const SocketEventEnum = {
  USER_CONNECTED: "connected",
  USER_DISCONNECTED: "disconnected",
};

export { DB_NAME, COOKIE_OPTIONS, SocketEventEnum };
