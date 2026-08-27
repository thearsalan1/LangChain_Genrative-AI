import express from "express";
import documentRoutes from "./src/routes/documentRoutes.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/utils/logger.js";

const app = express();
app.use(express.json());
app.use("/api/documents", documentRoutes);

app.listen(env.PORT, () => {
  logger.info(`Server running at http://localhost:${env.PORT}`);
});
