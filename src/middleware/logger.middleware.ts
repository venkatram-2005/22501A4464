import axios from "axios";
import { Request, Response, NextFunction } from "express";

const LOGGING_ENDPOINT = process.env.LOGGING_ENDPOINT || "http://20.244.56.144/evaluation-service/logs";
const token = process.env.ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ2YWxsdXJpdmVua2F0cmFtQGdtYWlsLmNvbSIsImV4cCI6MTc1MTA5MjUzMiwiaWF0IjoxNzUxMDkxNjMyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiODBhYzNkMWYtYjU5Mi00ZWVjLTk2NWUtMWVjNzczNTI1ZDliIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoidmFsbHVyaSB2ZW5rYXRyYW0iLCJzdWIiOiI4YzAwNjVjYS02ZWVkLTQ3N2QtYjMyYS1iYTcwNmEwN2Q5YTIifSwiZW1haWwiOiJ2YWxsdXJpdmVua2F0cmFtQGdtYWlsLmNvbSIsIm5hbWUiOiJ2YWxsdXJpIHZlbmthdHJhbSIsInJvbGxObyI6IjIyNTAxYTQ0NjQiLCJhY2Nlc3NDb2RlIjoiZUhXTnp0IiwiY2xpZW50SUQiOiI4YzAwNjVjYS02ZWVkLTQ3N2QtYjMyYS1iYTcwNmEwN2Q5YTIiLCJjbGllbnRTZWNyZXQiOiJUR2hLRkdWZ3hkZ0N3ZHlrIn0.Qi_JtP1IClQEztuiigE5mWjPQc5PC6JdTqn_C_PAQJA";

type LogPackage = "controller" | "middleware" | "handler" | "utils";

export const Log = async (
  stack: "backend" | "frontend",
  level: "info" | "debug" | "warn" | "error" | "fatal",
  pkg: LogPackage,
  message: string
): Promise<void> => {
  const truncatedMessage = message.length > 48 ? message.slice(0, 45) + "..." : message;

  try {
    await axios.post(
      LOGGING_ENDPOINT,
      { stack, level, package: pkg, message: truncatedMessage },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Logging service failed:", error.response.data);
    } else {
      console.error("Unexpected error while logging:", error);
    }
  }
};


export const logMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  Log("backend", "info", "middleware", `Incoming ${req.method} request to ${req.originalUrl}`);
  next();
};
