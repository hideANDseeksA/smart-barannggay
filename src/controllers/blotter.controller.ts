import { Request, Response } from "express"
import prisma from "../prisma"
import { uploadToSupabase } from "../utils/supabaseUpload.util"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import { createEmbedding } from "../utils/embedding";
import { lowercaseJson, uppercaseDeep, lowercaseDeep } from "../helper/lowercase.helper";
import { decryptAll, encrypt } from "../utils/crypto.util";
import { Prisma } from "@prisma/client";
import { updateSupabaseFile } from "../utils/supabaseUpdate.util"
import { apiCache } from "../utils/apiCache";

export const createBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id, details, status } = req.body;
    const file = req.file;

   let file_path: string | null = null;



    
      if (file) {
      file_path = await uploadToSupabase({
        bucket: "blotter",
        file, // ← still a FILE, not string
      });
    }

    /* Decrypt and embed details */
    const decrypted = decryptAll(details);
    const details_lowercase = lowercaseJson(decrypted);
    const vector = await createEmbedding(details_lowercase);
    const vectorSql = Prisma.raw(`'[${vector.join(",")}]'::"smart-barangay".vector`);

    await prisma.$queryRaw`
  INSERT INTO "smart-barangay".blotter
    (id, resident_id, details, status, file_path, embeddings)
  VALUES
    (
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

export const searchBlotters = async (req: Request, res: Response) => {
  try {
    const { query, limit = 15 } = req.body;
    if (!query)
      return res.status(400).json({ message: "Query is required" });

    /* 1️⃣ Lowercase query BEFORE embedding */
    const queryLowercase =
      typeof query === "string" ? query.toLowerCase() : lowercaseDeep(query);

    const embedding = await createEmbedding(queryLowercase);
    const vectorLiteral = `[${embedding.join(",")}]`;

    /* 2️⃣ Vector search */
    const threshold = 0.2;
    const results: BlotterResult[] =
      await prisma.$queryRaw<BlotterResult[]>`
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
    AND 1 - (embeddings <=> ${vectorLiteral}::vector) >= ${threshold}
  ORDER BY embeddings <=> ${vectorLiteral}::vector
  LIMIT ${Number(limit)};
      `;

    const resultsWithUrls: BlotterResult[] = await Promise.all(
      results.map(async (r) => ({
        ...r,
        file_url: r.file_path
          ? await generateSignedUrl(r.file_path, 60 * 5)
          : null,
      }))
    );




    const formattedResults: BlotterResult[] = results.map((r) => {
      let detailsObj: Record<string, any>;

      // Check if details is a string (double-encoded)
      if (typeof r.details === "string") {
        try {
          detailsObj = JSON.parse(decryptAll(r.details)); // parse string into object
        } catch {
          detailsObj = {}; // fallback if parsing fails
        }
      } else {
        detailsObj = decryptAll(r.details); 
      }

      return {
        ...r,
        details: uppercaseDeep(detailsObj),
        file_url: resultsWithUrls.find((res) => res.id === r.id)?.file_url || null,

      };
    });
    res.json(formattedResults);
  } catch (err) {
    console.error("Error searching blotters:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





/* READ ALL */
export const getbBlotter = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    // Create a unique cache key per page & limit
    const cacheKey = `blotters_page_${page}_limit_${limit}`;

    // Use apiCache to fetch or return cached data
    const blottersWithUrls = await apiCache.get(cacheKey, async () => {
      // 1️⃣ Fetch blotters from DB
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
          details: blotter.details ? JSON.parse(decryptAll(blotter.details)) : null,
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
    }, 60 * 60); 

    res.json(blottersWithUrls);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};


export const getBlotterById = async (req: Request, res: Response): Promise<void> => {
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

    const blotterWithUrl = {
      ...blotter,
      file_url: blotter.file_path
        ? await generateSignedUrl(blotter.file_path, 60 * 5)
        : null,
      details: blotter.details ? JSON.parse(decryptAll(blotter.details)) : null,
    };

    res.json(blotterWithUrl);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

/* UPDATE */
export const updateBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { details, status, resident_id } = req.body;
    const file = req.file;
    const { id } = req.params;

    /* 1️⃣ Prepare fields */
    let file_path: string | undefined;
    let vectorSql: Prisma.Sql | undefined;

    const existing = await prisma.blotter.findUnique({
      where: { id },
    })

    if (!existing) {
      res.status(404).json({ error: "Blotter not found" })
      return
    }

    /* 2️⃣ Handle file upload (optional) */
    if (file) {
      file_path = await updateSupabaseFile({
        bucket: "blotter",
        file,
        oldPath: existing.file_path,
      });
    }

    /* 3️⃣ Handle details + embeddings (optional but recommended) */
    if (details) {
      const decrypted = decryptAll(details);
      const detailsLowercase = lowercaseJson(decrypted);
      const vector = await createEmbedding(detailsLowercase);

      vectorSql = Prisma.raw(`'[${vector.join(",")}]'::vector`);
    }

    /* 4️⃣ Raw update so pgvector works */
    await prisma.$queryRaw`
      UPDATE "smart-barangay".blotter
      SET
        details     = COALESCE(${details}, details),
        status      = COALESCE(${status}, status),
        resident_id = COALESCE(${resident_id}::uuid, resident_id),
        file_path   = COALESCE(${file_path}, file_path),
        embeddings  = COALESCE(${vectorSql}, embeddings),
        updated_at  = NOW()
      WHERE id = ${id}::uuid
    `;

    res.json({ message: "Blotter updated successfully" });
  } catch (err) {
    console.error("Update blotter error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};


/* DELETE */
export const deleteBlotter = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.blotter.delete({
      where: { id: req.params.id },
    })
    apiCache.clearAll();
    res.json({ message: "blotter deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
