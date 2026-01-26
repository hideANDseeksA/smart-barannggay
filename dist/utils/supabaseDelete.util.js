"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromSupabase = void 0;
const bucket_1 = require("../supabase/bucket");
const deleteFromSupabase = async ({ bucket, path, }) => {
    if (!path)
        return;
    // Normalize path inside bucket: remove bucket prefix if exists
    let filePath = path.replace(`${bucket}/`, "").replace(/^\/+/, "");
    if (!filePath)
        return;
    // Optional: debug
    console.log("Deleting from Supabase:", bucket, filePath);
    const { data, error } = await bucket_1.supabase.storage.from(bucket).remove([filePath]);
    if (error)
        throw error;
};
exports.deleteFromSupabase = deleteFromSupabase;
