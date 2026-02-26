import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

let embedder: FeatureExtractionPipeline | null = null;

/**
 * Load the embedding model once and cache it
 */
async function loadEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    console.log("🔄 Loading multilingual-e5-base (768d)...");
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-mpnet-base-v2"
    );
    console.log("✅ multilingual-e5-base loaded");
  }
  return embedder;
}

/**
 * Flatten any nested object into plain text
 */
export function flattenText(input: any): string {
  if (!input) return "";

  if (typeof input === "string") return input;
  if (typeof input === "number") return input.toString();
  if (typeof input === "boolean") return input ? "true" : "false";

  if (Array.isArray(input)) {
    return input.map(flattenText).join(" ");
  }

  if (typeof input === "object") {
    return Object.entries(input)
      .map(([key, value]) => `${key}: ${flattenText(value)}`)
      .join(" ");
  }

  return "";
}

/**
 * Render blotter details into human-readable text
 */
export function renderBlotterForEmbedding(details: any): string {
  if (!details || typeof details !== "object") {
    return flattenText(details);
  }

  if (!details.date && !details.complaint_details) {
    return flattenText(details);
  }

  return `
Uri ng Reklamo: ${details.complaint_type ?? ""}
Pangalan ng Nagreklamo: ${details.name1 ?? ""}
Kasarian: ${details.sex1 ?? ""}
Tirahan: ${details.address1 ?? ""}
Katayuan sa Buhay: ${details.occupation1 ?? ""}

Pangalan ng Nirereklamo: ${details.name2 ?? ""}
Kasarian: ${details.sex2 ?? ""}
Tirahan: ${details.address2 ?? ""}
Katayuan sa Buhay: ${details.occupation2 ?? ""}

Detalye ng Reklamo:
${details.complaint_details ?? ""}

Nagpatala: ${details.name3 ?? ""}
`.trim();
}

/**
 * Generate embedding (768 dimensions)
 */
export async function createEmbedding(
  input: string | object,
  type: "passage" | "query" = "passage"
): Promise<number[]> {
  let parsedInput: any = input;

  if (typeof input === "string") {
    try {
      const maybeObject = JSON.parse(input);
      if (maybeObject && typeof maybeObject === "object") {
        parsedInput = maybeObject;
      }
    } catch {}
  }

  const rawText =
    typeof parsedInput === "object"
      ? renderBlotterForEmbedding(parsedInput)
      : parsedInput;

  const text = rawText?.trim();

  if (!text) {
    throw new Error("Text must be non-empty for embedding");
  }

  const model = await loadEmbedder();

  // IMPORTANT: E5 models require prefix
  const formatted = `${type}: ${text}`;

  const tensor = await model(formatted, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(tensor.data as Float32Array);
}