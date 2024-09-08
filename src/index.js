import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

import "./models/model.relationship.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server is running on port http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log("POSTGRESQL DB connection failed !!!", error);
  });
