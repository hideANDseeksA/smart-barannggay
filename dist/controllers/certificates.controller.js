"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCertificates = exports.updateCertificates = exports.getCertificates = exports.createCertificates = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const supabaseUpload_util_1 = require("../utils/supabaseUpload.util");
const supabaseUrl_util_1 = require("../utils/supabaseUrl.util");
const supabaseUpdate_util_1 = require("../utils/supabaseUpdate.util");
const supabaseDelete_util_1 = require("../utils/supabaseDelete.util");
const createCertificates = async (req, res) => {
    try {
        const { template_name, template_price, requestType } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "Template file is required" });
            return;
        }
        /* Upload once, reuse everywhere */
        const template_path = await (0, supabaseUpload_util_1.uploadToSupabase)({
            bucket: "certificate_template",
            file,
        });
        const certificate = await prisma_1.default.certificates.create({
            data: {
                template_name,
                template_price: template_price
                    ? Number(template_price)
                    : null,
                template_path,
                requestType: requestType === undefined
                    ? true
                    : requestType === "true" || requestType === true,
            },
        });
        res.status(201).json(certificate);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
exports.createCertificates = createCertificates;
/* READ ALL */
const getCertificates = async (_req, res) => {
    try {
        const certificates = await prisma_1.default.certificates.findMany();
        const result = await Promise.all(certificates.map(async (cert) => ({
            ...cert,
            template_url: cert.template_path
                ? await (0, supabaseUrl_util_1.generateSignedUrl)(cert.template_path, 60 * 5)
                : null,
        })));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err instanceof Error ? err.message : "Unknown error occurred",
        });
    }
};
exports.getCertificates = getCertificates;
/* UPDATE */
const updateCertificates = async (req, res) => {
    try {
        const { id } = req.params;
        const { template_name, template_price, requestType } = req.body;
        const file = req.file;
        // 1️⃣ Find existing certificate
        const existing = await prisma_1.default.certificates.findUnique({
            where: { id },
        });
        if (!existing) {
            res.status(404).json({ error: "Certificate not found" });
            return;
        }
        let template_path = existing.template_path;
        // 2️⃣ If new file uploaded, replace old file
        if (file) {
            template_path = await (0, supabaseUpdate_util_1.updateSupabaseFile)({
                bucket: "certificate_template",
                file,
                oldPath: existing.template_path,
            });
        }
        // 3️⃣ Update certificate in DB
        const updated = await prisma_1.default.certificates.update({
            where: { id },
            data: {
                template_name: template_name ?? existing.template_name,
                template_price: template_price
                    ? Number(template_price)
                    : existing.template_price,
                template_path,
                requestType: requestType === undefined
                    ? existing.requestType
                    : requestType === "true" || requestType === true,
            },
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err instanceof Error ? err.message : "Unknown error occurred",
        });
    }
};
exports.updateCertificates = updateCertificates;
/* DELETE */
const deleteCertificates = async (req, res) => {
    try {
        // 1️⃣ Find the certificate to get template_path
        const existing = await prisma_1.default.certificates.findUnique({
            where: { id: req.params.id },
        });
        if (!existing) {
            res.status(404).json({ error: "Certificate not found" });
            return;
        }
        // 2️⃣ Delete file from Supabase if exists
        if (existing.template_path) {
            await (0, supabaseDelete_util_1.deleteFromSupabase)({
                bucket: "certificate_template",
                path: existing.template_path,
            });
        }
        // 3️⃣ Delete record from DB
        await prisma_1.default.certificates.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "Certificate deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err instanceof Error ? err.message : "Unknown error occurred",
        });
    }
};
exports.deleteCertificates = deleteCertificates;
