import express from "express";
import blogRoute from "./src/routes/careerBlogs.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/utils/logger.js";

const app = express();

app.use(express.json());

app.use("/api", blogRoute);

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});
