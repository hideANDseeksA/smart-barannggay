import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

let embedder: FeatureExtractionPipeline | null = null;

/**
 * Load and cache BGE-M3 (1024 dimensions).
 * Best model for Tagalog / Taglish semantic search.
 * Handles code-switching naturally (e.g. "nag-away", "ginahasa", "nagnakaw").
 */
async function loadEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    console.log("🔄 Loading BAAI/bge-m3 (1024d)...");
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/bge-m3"
    );
    console.log("✅ BAAI/bge-m3 loaded");
  }
  return embedder;
}


export function renderBlotterForEmbedding(details: any): string {
  if (!details || typeof details !== "object") return "";

  const complaintType    = details.complaint_type?.trim()    || "";
  const complaintDetails = details.complaint_details?.trim() || "";
  const location         = details.location?.trim()          || "";

  if (!complaintType && !complaintDetails) return "";

  return [
    `Barangay blotter complaint report.`,
    `Complaint type: ${complaintType}.`,
    `Offense category: ${complaintType}.`,                    // repeated for mean-pool weight
    complaintDetails ? `Incident details: ${complaintDetails}` : "",
    location         ? `Location of incident: ${location}.`  : "",
    `This barangay blotter case involves ${complaintType}.`,  // closing semantic anchor
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Generate a normalized embedding vector using BGE-M3.
 * Vectors are L2-normalized — cosine similarity = dot product.
 *
 * ⚠️  BGE-M3 does NOT require a "query:" / "passage:" prefix like E5.
 *     The `type` parameter is kept for API compatibility but is unused.
 *
 * @param input  Raw string or blotter details object.
 * @param type   Kept for drop-in compatibility — ignored by BGE-M3.
 */
export async function createEmbedding(
  input: string | object,
  type: "passage" | "query" = "passage" // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<number[]> {
  let text: string;

  if (typeof input === "object") {
    text = renderBlotterForEmbedding(input);
  } else {
    text = input.trim();
  }

  if (!text) {
    throw new Error("Text must be non-empty for embedding");
  }

  const model = await loadEmbedder();

  // BGE-M3 does NOT use query:/passage: prefixes — pass text directly.
  const output = await model(text, {
    pooling: "mean",
    normalize: true, // required for correct cosine similarity
  });

  return Array.from(output.data as Float32Array);
}