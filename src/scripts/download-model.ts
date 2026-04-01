import { pipeline, env } from "@xenova/transformers";
import path from "path";
import fs from "fs";

// Go up two levels: src/scripts → src → project root
const MODEL_CACHE = path.resolve(__dirname, "../../models");

fs.mkdirSync(MODEL_CACHE, { recursive: true });

env.cacheDir = MODEL_CACHE;
env.allowRemoteModels = true;
env.allowLocalModels = true;

async function download() {
  console.log(`⬇️  Downloading Xenova/bge-m3 to ${MODEL_CACHE} ...`);
  console.log("⚠️  This is ~1.1 GB — grab a coffee.");

  await pipeline("feature-extraction", "Xenova/bge-m3");

  console.log("✅ Model cached at ./models");
  console.log("👉 Ready to build and run offline.");
}

download().catch((err) => {
  console.error("❌ Download failed:", err);
  process.exit(1);
});


// import { pipeline, env } from "@xenova/transformers";
// import path from "path";
// import fs from "fs";

// const MODEL_CACHE = path.resolve(process.cwd(), "models");

// fs.mkdirSync(MODEL_CACHE, { recursive: true });

// env.cacheDir = MODEL_CACHE;
// env.allowRemoteModels = true;
// env.allowLocalModels = true;

// async function download() {
//   console.log(`⬇️ Downloading Xenova/bge-m3 to ${MODEL_CACHE} ...`);
//   console.log("⚠️ This is large and may take time.");

//   await pipeline("feature-extraction", "Xenova/bge-m3");

//   console.log("✅ Model cached at ./models");
//   console.log("👉 Ready to build and run offline.");
// }

// download().catch((err) => {
//   console.error("❌ Download failed:", err);
//   process.exit(1);
// });