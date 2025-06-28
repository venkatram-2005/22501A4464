import { Request, Response } from "express";
import { Log } from "../middleware/logger.middleware";
import { generateShortcode } from "../utils/shortcode";
import dayjs from "dayjs";
import { getGeoLocation } from "../utils/location";

const urlMap = new Map<string, any>();

export const createShortUrl: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      await Log("backend", "error", "handler", "Invalid URL input");
      res.status(400).json({ error: "Invalid or missing URL." });
      return;
    }

    let code = shortcode;
    if (code) {
      if (urlMap.has(code)) {
        await Log("backend", "error", "handler", "Shortcode collision");
        res.status(409).json({ error: "Shortcode already in use." });
        return;
      }
    } else {
      do {
        code = generateShortcode();
      } while (urlMap.has(code!));
    }

    const ttlMinutes = typeof validity === "number" ? validity : 30;
    const expiry = dayjs().add(ttlMinutes, "minute").toISOString();

    urlMap.set(code!, {
      originalUrl: url,
      createdAt: new Date().toISOString(),
      expiry,
      clickStats: [],
    });

    await Log("backend", "info", "controller", `Short URL created for ${url} as ${code}`);

    res.status(201).json({
      shortLink: `https://hostname:port/${code}`,
      expiry,
    });
  } catch (err: any) {
    await Log("backend", "fatal", "controller", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleRedirect: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const record = urlMap.get(shortcode);

    if (!record) {
      await Log("backend", "warn", "controller", `Shortcode not found: ${shortcode}`);
      res.status(404).json({ error: "Shortcode not found" });
      return;
    }

    const isExpired = dayjs().isAfter(dayjs(record.expiry));
    if (isExpired) {
      await Log("backend", "warn", "controller", `Shortcode expired: ${shortcode}`);
      res.status(410).json({ error: "Shortlink has expired" });
      return;
    }

    record.clickStats.push({
      timestamp: new Date().toISOString(),
      source: req.get("referer") || "unknown",
      location: getGeoLocation(req.ip || "0.0.0.0"),
    });

    await Log("backend", "info", "controller", `Redirecting ${shortcode} to ${record.originalUrl}`);
    res.redirect(record.originalUrl);
  } catch (err: any) {
    await Log("backend", "error", "controller", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getStats: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const record = urlMap.get(shortcode);

    if (!record) {
      await Log("backend", "warn", "controller", `Stats lookup failed: ${shortcode}`);
      res.status(404).json({ error: "Shortcode not found" });
      return;
    }

    res.status(200).json({
      originalUrl: record.originalUrl,
      createdAt: record.createdAt,
      expiry: record.expiry,
      clicks: record.clickStats.length,
      clickDetails: record.clickStats,
    });
  } catch (err: any) {
    await Log("backend", "error", "controller", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
