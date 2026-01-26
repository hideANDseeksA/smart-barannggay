"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificateForm = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const supabaseUrl_util_1 = require("../utils/supabaseUrl.util");
const certificate_generator_1 = require("../utils/certificates/certificate.generator");
const getCertificateForm = async (req, res) => {
    const cert = await prisma_1.default.certificates.findUnique({
        where: { id: req.params.id },
    });
    if (!cert?.template_path) {
        return res.status(400).json({ error: "Template not found" });
    }
    const signedUrl = await (0, supabaseUrl_util_1.generateSignedUrl)(cert.template_path, 60 * 5);
    if (!signedUrl) {
        return res.status(400).json({ error: "Failed to generate signed URL" });
    }
    const fields = await (0, certificate_generator_1.extractDocxFields)(signedUrl);
    res.json({
        template_id: cert.id,
        template_name: cert.template_name,
        requestType: cert.requestType,
        fields: fields.map(name => ({
            name,
            label: name.replace(/_/g, " "),
            type: "text",
            required: true,
        })),
    });
};
exports.getCertificateForm = getCertificateForm;
