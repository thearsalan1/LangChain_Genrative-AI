import dotenv from "dotenv";
dotenv.config();

import express from "express";
import apiRoute from "./routes/router.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
const app = express();

app.use(express.json());

app.use("/api", apiRoute);

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`server is running at http://localhost:${PORT}`);
});
