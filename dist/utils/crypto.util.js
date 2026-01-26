"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptAll = exports.safeDecrypt = exports.decrypt = exports.encrypt = void 0;
// src/utils/crypto.util.ts
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const SECRET = process.env.ENCRYPTION_SECRET;
if (!SECRET || SECRET.length < 32) {
    throw new Error("ENCRYPTION_SECRET must be at least 32 characters");
}
const key = crypto_1.default.createHash("sha256").update(SECRET).digest();
/* ================= ENCRYPT / DECRYPT ================= */
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
};
exports.encrypt = encrypt;
const decrypt = (text) => {
    const [ivHex, encryptedText] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
exports.decrypt = decrypt;
/* ================= HELPERS ================= */
const isIsoDateString = (value) => {
    return !isNaN(Date.parse(value));
};
const normalizeDate = (value) => {
    // Date instance
    if (value instanceof Date) {
        return value.toISOString();
    }
    // ISO date string
    if (typeof value === 'string' && isIsoDateString(value)) {
        return new Date(value).toISOString();
    }
    return value;
};
const safeDecrypt = (value) => {
    // Don't touch numbers, booleans, null, undefined, or Date objects
    if (typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined ||
        value instanceof Date) {
        return value;
    }
    // Only strings should be decrypted
    if (typeof value !== 'string')
        return value;
    // If the string is not encrypted, just return it
    if (!value.includes(':'))
        return value;
    try {
        return (0, exports.decrypt)(value); // Only decrypt, no date parsing
    }
    catch {
        return value;
    }
};
exports.safeDecrypt = safeDecrypt;
const decryptAll = (data) => {
    // Array
    if (Array.isArray(data)) {
        return data.map(exports.decryptAll);
    }
    // Date object → leave untouched
    if (data instanceof Date) {
        return data;
    }
    // Object
    if (data !== null && typeof data === 'object') {
        const result = {};
        for (const key in data) {
            result[key] = (0, exports.decryptAll)(data[key]);
        }
        return result;
    }
    // Primitive → safeDecrypt
    return (0, exports.safeDecrypt)(data);
};
exports.decryptAll = decryptAll;
