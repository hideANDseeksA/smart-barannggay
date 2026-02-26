import { Request, Response } from "express";
import { getClient } from "@umami/api-client";

const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

const client = getClient();

// ─── Helper ───────────────────────────────────────────────────────────────────

function getDefaultDateRange() {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  return { startAt: thirtyDaysAgo, endAt: now };
}

function requireWebsiteId(res: Response): string | null {
  if (!WEBSITE_ID) {
    res.status(400).json({ error: "UMAMI_WEBSITE_ID is not set" });
    return null;
  }
  return WEBSITE_ID;
}

// ─── Me ───────────────────────────────────────────────────────────────────────

/**
 * GET /me
 * Returns the currently authenticated user's profile.
 */
export const getMe = async (_req: Request, res: Response) => {
  try {
    const { ok, data, status, error } = await client.getMe();
    if (!ok) return res.status(status).json({ error });
    return res.json(data);
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

/**
 * GET /me/websites
 * Returns all websites owned by the authenticated user.
 */
export const getMyWebsites = async (_req: Request, res: Response) => {
  try {
    const { ok, data, status, error } = await client.getMyWebsites();
    if (!ok) return res.status(status).json({ error });
    return res.json(data);
  } catch (err) {
    console.error("getMyWebsites error:", err);
    return res.status(500).json({ error: "Failed to fetch user websites" });
  }
};

// ─── Websites ─────────────────────────────────────────────────────────────────

/**
 * GET /websites
 * Returns all websites the authenticated user has access to.
 */
export const getWebsites = async (_req: Request, res: Response) => {
  try {
    const { ok, data, status, error } = await client.getWebsites();
    if (!ok) return res.status(status).json({ error });
    return res.json(data);
  } catch (err) {
    console.error("getWebsites error:", err);
    return res.status(500).json({ error: "Failed to fetch websites" });
  }
};

/**
 * GET /website
 * Returns details of the website defined in UMAMI_WEBSITE_ID.
 */
export const getWebsite = async (_req: Request, res: Response) => {
  try {
    const id = requireWebsiteId(res);
    if (!id) return;

    const { ok, data, status, error } = await client.getWebsite(id);
    if (!ok) return res.status(status).json({ error });
    return res.json(data);
  } catch (err) {
    console.error("getWebsite error:", err);
    return res.status(500).json({ error: "Failed to fetch website" });
  }
};

/**
 * GET /website/active
 * Returns the number of active visitors on the website right now.
 */
export const getWebsiteActive = async (_req: Request, res: Response) => {
  try {
    const id = requireWebsiteId(res);
    if (!id) return;

    const { ok, data, status, error } = await client.getWebsiteActive(id);
    if (!ok) return res.status(status).json({ error });
    return res.json(data);
  } catch (err) {
    console.error("getWebsiteActive error:", err);
    return res.status(500).json({ error: "Failed to fetch active visitors" });
  }
};

/**
 * GET /website/stats
 * Returns aggregated stats (pageviews, visitors, visits, bounces, totalTime)
 * for a given date range.
 *
 * Query params: startAt, endAt (Unix ms timestamps), url, referrer, title,
 *               query, event, os, browser, device, country, region, city
 */
export const getWebsiteStats = async (req: Request, res: Response) => {
  try {
    const id = requireWebsiteId(res);
    if (!id) return;

    const { startAt, endAt, ...filters } = req.query as Record<string, string>;
    const defaults = getDefaultDateRange();

    const { ok, data, status, error } = await client.getWebsiteStats(id, {
      startAt: startAt ? Number(startAt) : defaults.startAt,
      endAt: endAt ? Number(endAt) : defaults.endAt,
      ...filters,
    });

    if (!ok) return res.status(status).json({ error });
    return res.json(data);
  } catch (err) {
    console.error("getWebsiteStats error:", err);
    return res.status(500).json({ error: "Failed to fetch website stats" });
  }
};

