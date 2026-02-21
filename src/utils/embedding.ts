import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

let embedder: FeatureExtractionPipeline | null = null;

/**
 * Load the embedding model once and cache it
 */
async function loadEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    console.log("🔄 Loading embedding model...");
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L12-v2"
    );
    console.log("✅ Embedding model loaded");
  }
  return embedder;
}

/**
 * Flatten any nested object into plain text
 */
export function flattenText(input: any): string {
  console.log("📦 flattenText() called with:", input);

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
  console.log("📝 renderBlotterForEmbedding() called");

  if (!details || typeof details !== "object") {
    console.log("⚠️ Not an object, falling back to flattenText()");
    return flattenText(details);
  }

  // If it doesn't look like a blotter structure, flatten it
  if (!details.date && !details.complaint_details) {
    console.log("⚠️ Not a blotter structure, flattening instead");
    return flattenText(details);
  }

  console.log("✅ Recognized as blotter structure");

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
`;
}

/**
 * Generate embedding
 */
export async function createEmbedding(
  input: string | object
): Promise<number[]> {
  console.log("=================================");
  console.log("🚀 createEmbedding() START");
  console.log("Input Type:", typeof input);

  let parsedInput: any = input;

  // ✅ If string, check if it's JSON
  if (typeof input === "string") {
    try {
      const maybeObject = JSON.parse(input);
      if (typeof maybeObject === "object") {
        console.log("🔄 Detected JSON string. Parsed into object.");
        parsedInput = maybeObject;
      }
    } catch {
      console.log("➡️ Normal string (not JSON)");
    }
  }

  let text: string;

  if (typeof parsedInput === "object") {
    text = renderBlotterForEmbedding(parsedInput);
  } else {
    text = parsedInput;
  }

  console.log("📄 Final Text For Embedding:\n", text.trim());

  if (!text.trim()) {
    throw new Error("❌ Text must be non-empty for embedding");
  }

  const model = await loadEmbedder();
  const tensor = await model(text, { pooling: "mean", normalize: true });

  const vector = Array.from(tensor.data as Float32Array);

  console.log("✅ Embedding created");
  console.log("📏 Vector dimension:", vector.length);
  console.log("=================================");

  return vector;
}