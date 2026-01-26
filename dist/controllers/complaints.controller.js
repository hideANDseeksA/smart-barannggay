"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletecomplaints = exports.updatecomplaints = exports.getcomplaints = exports.createComplaints = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const supabaseUpload_util_1 = require("../utils/supabaseUpload.util");
const supabaseUrl_util_1 = require("../utils/supabaseUrl.util");
const supabaseUpdate_util_1 = require("../utils/supabaseUpdate.util");
const supabaseDelete_util_1 = require("../utils/supabaseDelete.util");
const createComplaints = async (req, res) => {
    try {
        const { resident_id, complaint_type, description, filed_at, status } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "Template file is required" });
            return;
        }
        /* Upload once, reuse everywhere */
        const image_paths = await (0, supabaseUpload_util_1.uploadToSupabase)({
            bucket: "complaints",
            file,
        });
        const complaints = await prisma_1.default.complaints.create({
            data: {
                resident_id,
                complaint_type,
                description,
                filed_at: filed_at ? new Date(filed_at) : filed_at,
                status,
                image_paths,
            },
        });
        res.status(201).json(complaints);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
exports.createComplaints = createComplaints;
/* READ ALL */
const getcomplaints = async (_req, res) => {
    try {
        const complaints = await prisma_1.default.complaints.findMany();
        const result = await Promise.all(complaints.map(async (comp) => ({
            ...comp,
            image_url: comp.image_paths
                ? await (0, supabaseUrl_util_1.generateSignedUrl)(comp.image_paths, 60 * 5)
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
exports.getcomplaints = getcomplaints;
/* UPDATE */
const updatecomplaints = async (req, res) => {
    try {
        const { id } = req.params;
        const { resident_id, complaint_type, description, filed_at, status } = req.body;
        const file = req.file;
        // 1️⃣ Find existing complaints
        const existing = await prisma_1.default.complaints.findUnique({
            where: { id },
        });
        if (!existing) {
            res.status(404).json({ error: "complaints not found" });
            return;
        }
        let image_paths = existing.image_paths;
        // 2️⃣ If new file uploaded, replace old file
        if (file) {
            image_paths = await (0, supabaseUpdate_util_1.updateSupabaseFile)({
                bucket: "complaints",
                file,
                oldPath: existing.image_paths,
            });
        }
        // 3️⃣ Update complaints in DB
        const updated = await prisma_1.default.complaints.update({
            where: { id },
            data: {
                resident_id,
                complaint_type,
                description,
                filed_at: filed_at ? new Date(filed_at) : filed_at,
                status,
                image_paths,
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
exports.updatecomplaints = updatecomplaints;
/* DELETE */
const deletecomplaints = async (req, res) => {
    try {
        // 1️⃣ Find the complaints to get image_paths
        const existing = await prisma_1.default.complaints.findUnique({
            where: { id: req.params.id },
        });
        if (!existing) {
            res.status(404).json({ error: "complaints not found" });
            return;
        }
        // 2️⃣ Delete file from Supabase if exists
        if (existing.image_paths) {
            await (0, supabaseDelete_util_1.deleteFromSupabase)({
                bucket: "complaints",
                path: existing.image_paths,
            });
        }
        // 3️⃣ Delete record from DB
        await prisma_1.default.complaints.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "complaints deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err instanceof Error ? err.message : "Unknown error occurred",
        });
    }
};
exports.deletecomplaints = deletecomplaints;
