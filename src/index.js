import dotenv from "dotenv";
import httpServer from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log("Server listening on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Server error :-", err);
  });
