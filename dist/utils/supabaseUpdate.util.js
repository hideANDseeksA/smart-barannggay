"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupabaseFile = void 0;
const bucket_1 = require("../supabase/bucket");
const updateSupabaseFile = async ({ bucket, file, oldPath, folder = "", }) => {
    /* 1️⃣ Normalize old path */
    if (oldPath) {
        const normalizedPath = oldPath.replace(`${bucket}/`, "");
        const { error: deleteError } = await bucket_1.supabase.storage
            .from(bucket)
            .remove([normalizedPath]);
        if (deleteError) {
            console.error("Failed to delete old file:", deleteError);
        }
    }
    /* 2️⃣ Build new file path */
    const safeName = file.originalname.replace(/\s+/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    const fullPath = folder
        ? `${folder}/${fileName}`
        : fileName;
    /* 3️⃣ Upload new file */
    const { error: uploadError } = await bucket_1.supabase.storage
        .from(bucket)
        .upload(fullPath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
    });
    if (uploadError)
        throw uploadError;
    return `${bucket}/${fullPath}`;
};
exports.updateSupabaseFile = updateSupabaseFile;
