// src/app.ts
import express from "express";
import { env } from "./config/env.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(express.json());
app.use("/api", chatRoutes);

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
});
