"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocuments = exports.updateDocuments = exports.getDocuments = exports.createDocuments = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const supabaseUpload_util_1 = require("../utils/supabaseUpload.util");
const supabaseUrl_util_1 = require("../utils/supabaseUrl.util");
const supabaseUpdate_util_1 = require("../utils/supabaseUpdate.util");
const supabaseDelete_util_1 = require("../utils/supabaseDelete.util");
const crypto_util_1 = require("../utils/crypto.util");
/* CREATE */
const createDocuments = async (req, res) => {
    try {
        const { document_type_id, title, purpose, issued_date, expiration_date, status } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "Template file is required" });
            return;
        }
        const file_url = await (0, supabaseUpload_util_1.uploadToSupabase)({
            bucket: "documents",
            file,
        });
        const documents = await prisma_1.default.documents.create({
            data: {
                document_type_id,
                title,
                purpose,
                issued_date: issued_date ? new Date(issued_date) : null,
                expiration_date: expiration_date ? new Date(expiration_date) : null,
                status,
                file_url
            },
        });
        res.status(201).json(documents);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
};
exports.createDocuments = createDocuments;
/* READ ALL */
const getDocuments = async (_req, res) => {
    try {
        const documentss = await prisma_1.default.documents.findMany({
            include: {
                document_type: {
                    select: { name: true },
                },
            },
        });
        const result = await Promise.all(documentss.map(async (doc) => ({
            ...doc,
            file_url: doc.file_url ? await (0, supabaseUrl_util_1.generateSignedUrl)(doc.file_url, 60 * 5) : null,
            document_type: {
                name: (0, crypto_util_1.decrypt)(doc.document_type.name)
            }
        })));
        res.status(200).json(result);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
};
exports.getDocuments = getDocuments;
/* UPDATE */
const updateDocuments = async (req, res) => {
    try {
        const file = req.file;
        const { id } = req.params;
        const { document_type_id, title, purpose, issued_date, expiration_date, status } = req.body;
        const existingDocument = await prisma_1.default.documents.findUnique({
            where: { id },
        });
        if (!existingDocument) {
            res.status(404).json({ message: "Document not found" });
            return;
        }
        let file_url = existingDocument.file_url;
        if (file) {
            file_url = await (0, supabaseUpdate_util_1.updateSupabaseFile)({
                bucket: "documents",
                file,
                oldPath: existingDocument.file_url,
            });
        }
        const documents = await prisma_1.default.documents.update({
            where: { id },
            data: {
                document_type_id,
                title,
                purpose,
                issued_date: issued_date ? new Date(issued_date) : null,
                expiration_date: expiration_date ? new Date(expiration_date) : null,
                status,
                file_url
            },
        });
        res.status(200).json(documents);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
};
exports.updateDocuments = updateDocuments;
/* DELETE */
const deleteDocuments = async (req, res) => {
    try {
        const existingDocument = await prisma_1.default.documents.findUnique({
            where: { id: req.params.id },
        });
        if (!existingDocument) {
            res.status(404).json({ message: "Document not found" });
            return;
        }
        if (existingDocument.file_url) {
            await (0, supabaseDelete_util_1.deleteFromSupabase)({
                bucket: "documents",
                path: existingDocument.file_url,
            });
        }
        await prisma_1.default.documents.delete({
            where: { id: req.params.id },
        });
        res.status(200).json({ message: "documents deleted successfully" });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
};
exports.deleteDocuments = deleteDocuments;
