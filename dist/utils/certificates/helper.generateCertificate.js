"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificate = generateCertificate;
// src/utils/certificates/helper.generateCertificate.ts
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const axios_1 = __importDefault(require("axios"));
async function generateCertificate(templateUrl, data) {
    // 1️⃣ Fetch template
    const response = await axios_1.default.get(templateUrl, {
        responseType: "arraybuffer",
    });
    // 2️⃣ Load DOCX
    const zip = new pizzip_1.default(response.data);
    const doc = new docxtemplater_1.default(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: "[[", end: "]]" },
    });
    // 3️⃣ Render
    doc.render(data);
    // 4️⃣ Generate buffer
    return doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
}
