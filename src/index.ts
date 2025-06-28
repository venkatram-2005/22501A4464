import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import shortUrlRoutes from "./route/shorturl.route"; 
import { logMiddleware } from "./middleware/logger.middleware";
import { handleRedirect } from "./controller/shorturl.controller";
import type { ErrorRequestHandler } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(logMiddleware);

app.use("/shorturls", shortUrlRoutes);
app.get("/:shortcode", handleRedirect);

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
