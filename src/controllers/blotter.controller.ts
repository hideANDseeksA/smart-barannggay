import { Request, Response } from "express"
import prisma from "../prisma"
import { uploadToSupabase } from "../utils/supabaseUpload.util"
import { generateSignedUrl } from "../utils/supabaseUrl.util"
import { createEmbedding } from "../utils/embedding";
import { lowercaseJson,uppercaseDeep,lowercaseDeep } from "../helper/lowercase.helper";
import { decryptAll,encrypt } from "../utils/crypto.util";
import { Prisma } from "@prisma/client";

export const createBlotter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resident_id, details, status } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "Blotter file is required" });
      return;
    }

    /* Upload file to Supabase */
    const file_path = await uploadToSupabase({
      bucket: "blotter",
      file,
    });

    /* Decrypt and embed details */
    const decrypted = decryptAll(details);
    const details_lowercase = lowercaseJson(decrypted);
    const vector = await createEmbedding(details_lowercase); 
    const vectorSql = Prisma.raw(`'[${vector.join(",")}]'::vector`);

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
          1 - (embeddings <=> ${vectorLiteral}::vector(384)) AS score
        FROM "smart-barangay".blotter
        WHERE embeddings IS NOT NULL
          AND 1 - (embeddings <=> ${vectorLiteral}::vector(384)) >= ${threshold}
        ORDER BY embeddings <=> ${vectorLiteral}::vector(384)
        LIMIT ${Number(limit)}
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
    detailsObj = decryptAll(r.details); // already an object
  }

  return {
    ...r,
    details: uppercaseDeep(detailsObj),
    file_url:resultsWithUrls.find((res) => res.id === r.id)?.file_url || null,
    
  };
});

    /* 4️⃣ Debug logging */
    formattedResults.forEach((r) =>
      console.log(`Blotter ID: ${r.id}, Score: ${r.score}`)
    );
console.log(
  "CAP TEST:",
  uppercaseDeep({ test: "james rafer" })
);

    res.json(formattedResults);
  } catch (err) {
    console.error("Error searching blotters:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





/* READ ALL */
export const getbBlotter = async (_req: Request, res: Response): Promise<void> => {
  try {
    const blotters = await prisma.blotter.findMany({
      select:{
        id:true,
        resident_id:true,
        details:true,
        status:true,
        file_path:true,
        created_at:true,
        updated_at:true

      }
    })
    res.json(blotters)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}



/* UPDATE */
export const updateBlotter = async (req: Request, res: Response): Promise<void> => {
  try {
    const blotter = await prisma.blotter.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(blotter)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}

/* DELETE */
export const deleteBlotter = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.blotter.delete({
      where: { id: req.params.id },
    })
    res.json({ message: "blotter deleted successfully" })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
    } else {
      res.status(500).json({ error: "Unknown error occurred" })
    }
  }
}
