"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignedUrl = void 0;
const bucket_1 = require("../supabase/bucket");
/**
 * Generate a signed URL from a stored Supabase path
 * Returns null if path is invalid or file does not exist
 */
const generateSignedUrl = async (fullPath, expiresIn = 60 * 5) => {
    try {
        if (!fullPath || !fullPath.includes("/")) {
            return null;
        }
        const [bucket, ...pathParts] = fullPath.split("/");
        const filePath = pathParts.join("/");
        if (!bucket || !filePath)
            return null;
        const { data, error } = await bucket_1.supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn);
        if (error || !data?.signedUrl) {
            return null;
        }
        return data.signedUrl;
    }
    catch {
        return null;
    }
};
exports.generateSignedUrl = generateSignedUrl;
