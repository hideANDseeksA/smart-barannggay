"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
// src/utils/crypto.util.ts
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const SECRET = process.env.ENCRYPTION_SECRET;
if (!SECRET || SECRET.length < 32) {
    throw new Error("ENCRYPTION_SECRET must be at least 32 characters");
}
const key = crypto_1.default.createHash("sha256").update(SECRET).digest();
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
