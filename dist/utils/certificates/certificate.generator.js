"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDocxFields = extractDocxFields;
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const axios_1 = __importDefault(require("axios"));
/**
 * Extracts placeholder fields from a DOCX file stored at a URL.
 * Supports [[field_name]] placeholders.
 */
async function extractDocxFields(docxUrl) {
    try {
        const response = await axios_1.default.get(docxUrl, { responseType: "arraybuffer" });
        const zip = new pizzip_1.default(response.data);
        const doc = new docxtemplater_1.default(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: "[[", end: "]]" },
        });
        const text = doc.getFullText();
        const matches = text.match(/\[\[(.*?)\]\]/g) || [];
        return [
            ...new Set(matches
                .map(m => m.replace(/\[|\]/g, "").trim())
                .filter(field => field !== "issued") // 🚫 exclude [[issued]]
            ),
        ];
    }
    catch (err) {
        console.error("DOCX TEMPLATE ERROR:", err);
        return [];
    }
}
