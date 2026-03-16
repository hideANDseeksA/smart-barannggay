import { Request, Response } from "express";
import prisma from "../prisma";
import { uploadToSupabase } from "../utils/supabaseUpload.util";
import { generateSignedUrl } from "../utils/supabaseUrl.util";
import { createEmbedding } from "../utils/embedding";
import { lowercaseJson, uppercaseDeep } from "../helper/lowercase.helper";
import { decryptAll } from "../utils/crypto.util";
import { Prisma } from "@prisma/client";
import { updateSupabaseFile } from "../utils/supabaseUpdate.util";
import { apiCache } from "../utils/apiCache";
import { smartExpand } from "../utils/query-expansion";

// ─── types ────────────────────────────────────────────────────────────────────

type BlotterResult = {
  id: string;
  resident_id: string;
  details: Record<string, any>;
  status: string;
  file_path: string | null;
  file_url?: string | null;
  created_at: Date;
  updated_at: Date;
  score: number;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id, details, status } = req.body;
    const file = req.file;

    let file_path: string | null = null;

    if (file) {
      file_path = await uploadToSupabase({ bucket: "blotter", file });
    }

    // Decrypt → lowercase → embed
    const decrypted = decryptAll(details);
    const details_lowercase = lowercaseJson(decrypted);
    const vector = await createEmbedding(details_lowercase, "passage");
    const vectorSql = Prisma.raw(
      `'[${vector.join(",")}]'::"smart-barangay".vector`
    );

    await prisma.$queryRaw`
      INSERT INTO "smart-barangay".blotter
        (id, resident_id, details, status, file_path, embeddings)
      VALUES (
        gen_random_uuid(),
        ${resident_id}::uuid,
        ${details},
        ${status},
        ${file_path},
        ${vectorSql}
      )
    `;

    apiCache.clearAll();
    res.status(201).json({ message: "Blotter created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────
//
//  PURE SEMANTIC SEARCH — NO BM25
//  ─────────────────────────────────────────────────────────────────────────────
//  The `details` column is AES-encrypted so full-text (BM25/ts_rank) search
//  on it is impossible. Pure vector search + smartExpand() is used instead.
//
//  smartExpand() automatically:
//    • Detects known Tagalog/English crime aliases (pangagahasa → rape, etc.)
//    • Adds bilingual barangay-context anchors to close the query-passage gap
//    • Routes to person/location expansion when mode is set accordingly
//
//  Threshold guide for BGE-M3 (normalized cosine):
//    ≥ 0.80  → strong match
//    ≥ 0.70  → relevant              ← default
//    ≥ 0.60  → borderline (higher recall, lower precision)
//    < 0.60  → noise — never return these

export const searchBlotters = async (req: Request, res: Response) => {
  try {
    const {
      query,
      limit     = 15,
      mode      = "general",   // "general" | "person" | "location"
      threshold = 0.70,
    } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query is required" });
    }

    const raw = query.trim();

    // 1 ── Smart bilingual query expansion
    //      Handles Tagalog ↔ English aliases automatically.
    //      e.g. "pangagahasa" → expands to include "rape", "sexual assault", etc.
    const expanded = smartExpand(raw, mode);

    // 2 ── Embed — BGE-M3 needs no prefix (handled inside createEmbedding)
    const embedding = await createEmbedding(expanded, "query");
    const vectorLiteral = `[${embedding.join(",")}]`;

    // 3 ── Cosine similarity search — only records above threshold returned
    const finalResults = await prisma.$queryRaw<BlotterResult[]>`
      SELECT
        id,
        resident_id,
        details,
        status,
        file_path,
        created_at,
        updated_at,
        1 - (embeddings <=> ${vectorLiteral}::vector) AS score
      FROM "smart-barangay".blotter
      WHERE embeddings IS NOT NULL
        AND (1 - (embeddings <=> ${vectorLiteral}::vector)) >= ${Number(threshold)}
      ORDER BY embeddings <=> ${vectorLiteral}::vector
      LIMIT ${Number(limit)}
    `;

    // 4 ── Generate signed file URLs
    const resultsWithUrls = await Promise.all(
      finalResults.map(async (r) => ({
        ...r,
        file_url: r.file_path
          ? await generateSignedUrl(r.file_path, 60 * 5)
          : null,
      }))
    );

    // 5 ── Decrypt + uppercase details for response
    const formattedResults = resultsWithUrls.map((r) => {
      let detailsObj: Record<string, any>;
      if (typeof r.details === "string") {
        try {
          detailsObj = JSON.parse(decryptAll(r.details));
        } catch {
          detailsObj = {};
        }
      } else {
        detailsObj = decryptAll(r.details);
      }
      return { ...r, details: uppercaseDeep(detailsObj) };
    });

    res.json(formattedResults);
  } catch (err) {
    console.error("Error searching blotters:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── READ ALL (paginated) ─────────────────────────────────────────────────────

export const getbBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip  = (page - 1) * limit;

    const cacheKey = `blotters_page_${page}_limit_${limit}`;

    const blottersWithUrls = await apiCache.get(
      cacheKey,
      async () => {
        const [blotters, total] = await Promise.all([
          prisma.blotter.findMany({
            select: {
              id: true,
              resident_id: true,
              details: true,
              status: true,
              file_path: true,
              created_at: true,
              updated_at: true,
            },
            skip,
            take: limit,
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
      select: {
        id: true,
        resident_id: true,
        details: true,
        status: true,
        file_path: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!blotter) {
      res.status(404).json({ error: "Blotter record not found" });
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
    const { details, status, resident_id } = req.body;
    const file = req.file;
    const { id } = req.params;

    const existing = await prisma.blotter.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Blotter not found" });
      return;
    }

    let file_path: string | undefined;
    let vectorSql: Prisma.Sql | undefined;

    if (file) {
      file_path = await updateSupabaseFile({
        bucket: "blotter",
        file,
        oldPath: existing.file_path,
      });
    }

    if (details) {
      const decrypted = decryptAll(details);
      const detailsLowercase = lowercaseJson(decrypted);
      const vector = await createEmbedding(detailsLowercase, "passage");
      vectorSql = Prisma.raw(
        `'[${vector.join(",")}]'::"smart-barangay".vector`
      );
    }

    await prisma.$queryRaw`
      UPDATE "smart-barangay".blotter
      SET
        details     = COALESCE(${details},           details),
        status      = COALESCE(${status},            status),
        resident_id = COALESCE(${resident_id}::uuid, resident_id),
        file_path   = COALESCE(${file_path},         file_path),
        embeddings  = COALESCE(${vectorSql},         embeddings),
        updated_at  = NOW()
      WHERE id = ${id}::uuid
    `;

    apiCache.clearAll();
    res.json({ message: "Blotter updated successfully" });
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
    await prisma.blotter.delete({ where: { id: req.params.id } });
    apiCache.clearAll();
    res.json({ message: "Blotter deleted successfully" });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error occurred",
    });
  }
};