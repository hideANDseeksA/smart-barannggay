// blotter.controller.ts (EMBEDDING REMOVED / PURE PRISMA CRUD)

import { Request, Response } from "express";
import prisma from "../prisma";
import { uploadToSupabase } from "../utils/supabaseUpload.util";
import { generateSignedUrl } from "../utils/supabaseUrl.util";
import { decryptAll } from "../utils/crypto.util";
import { updateSupabaseFile } from "../utils/supabaseUpdate.util";
import { apiCache } from "../utils/apiCache";
import { titleCaseDeep } from "../helper/lowercase.helper";

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id, details, status, h_resident, case_no } = req.body;
    const file = req.file;

    let file_path: string | null = null;

    if (file) {
      file_path = await uploadToSupabase({
        bucket: "blotter",
        file,
      });
    }

    await prisma.blotter.create({
      data: {
        resident_id,
        details,
        status,
        h_resident,
        case_no,
        file_path,
      },
    });

    apiCache.clearAll();

    res.status(201).json({
      message: "Blotter created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

// ─── SEARCH (NORMAL FILTER ONLY) ──────────────────────────────────────────────
// Searches case_no, status, h_resident only
// details is encrypted so direct search is not reliable

export const searchBlotters = async (req: Request, res: Response) => {
  try {
    const { query, limit = 15 } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    const results = await prisma.blotter.findMany({
      where: {
        OR: [
          {
            case_no: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            status: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            h_resident: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      take: Number(limit),
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedResults = await Promise.all(
      results.map(async (r) => {
        let detailsObj: Record<string, any> = {};

        try {
          detailsObj = r.details ? JSON.parse(decryptAll(r.details)) : {};
        } catch {
          detailsObj = {};
        }

        return {
          ...r,
          file_url: r.file_path
            ? await generateSignedUrl(r.file_path, 60 * 5)
            : null,
          details: titleCaseDeep(detailsObj),
        };
      })
    );

    return res.json(formattedResults);
  } catch (err) {
    console.error("Error searching blotters:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ─── READ ALL (PAGINATED) ─────────────────────────────────────────────────────

export const getbBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string) || 10)
    );

    const skip = (page - 1) * limit;

    const cacheKey = `blotters_page_${page}_limit_${limit}`;

    const blottersWithUrls = await apiCache.get(
      cacheKey,
      async () => {
        const [blotters, total] = await Promise.all([
          prisma.blotter.findMany({
            skip,
            take: limit,
            orderBy: {
              created_at: "desc",
            },
          }),
          prisma.blotter.count(),
        ]);

        const results = await Promise.all(
          blotters.map(async (blotter) => ({
            ...blotter,
            file_url: blotter.file_path
              ? await generateSignedUrl(blotter.file_path, 60 * 60 * 24)
              : null,
            details: blotter.details
              ? JSON.parse(decryptAll(blotter.details))
              : null,
          }))
        );

        return {
          data: results,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      60 * 60
    );

    res.json(blottersWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};

// ─── READ ONE ─────────────────────────────────────────────────────────────────

export const getBlotterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const blotter = await prisma.blotter.findUnique({
      where: { id },
    });

    if (!blotter) {
      res.status(404).json({
        error: "Blotter record not found",
      });
      return;
    }

    res.json({
      ...blotter,
      file_url: blotter.file_path
        ? await generateSignedUrl(blotter.file_path, 60 * 5)
        : null,
      details: blotter.details
        ? JSON.parse(decryptAll(blotter.details))
        : null,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { details, status, resident_id, h_resident, case_no } = req.body;
    const file = req.file;
    const { id } = req.params;

    const existing = await prisma.blotter.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        error: "Blotter not found",
      });
      return;
    }

    let file_path: string | undefined;

    if (file) {
      file_path = await updateSupabaseFile({
        bucket: "blotter",
        file,
        oldPath: existing.file_path,
      });
    }

    await prisma.blotter.update({
      where: { id },
      data: {
        details: details ?? undefined,
        status: status ?? undefined,
        resident_id: resident_id ?? undefined,
        h_resident: h_resident ?? undefined,
        case_no: case_no ?? undefined,
        file_path: file_path ?? undefined,
        updated_at: new Date(),
      },
    });

    apiCache.clearAll();

    res.json({
      message: "Blotter updated successfully",
    });
  } catch (err) {
    console.error("Update blotter error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await prisma.blotter.delete({
      where: {
        id: req.params.id,
      },
    });

    apiCache.clearAll();

    res.json({
      message: "Blotter deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};