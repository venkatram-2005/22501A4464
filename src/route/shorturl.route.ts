import { Router } from "express";
import { createShortUrl, getStats } from "../controller/shorturl.controller";


const router = Router();

router.post("/", createShortUrl);
router.get("/:shortcode", getStats);

export default router;
