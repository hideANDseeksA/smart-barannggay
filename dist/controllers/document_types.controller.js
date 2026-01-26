"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument_types = exports.updateDocument_types = exports.getDocument_types = exports.createDocument_types = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/* CREATE */
const createDocument_types = async (req, res) => {
    try {
        const document_types = await prisma_1.default.document_types.create({
            data: req.body,
        });
        res.status(201).json(document_types);
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
exports.createDocument_types = createDocument_types;
/* READ ALL */
const getDocument_types = async (_req, res) => {
    try {
        const document_typess = await prisma_1.default.document_types.findMany();
        res.json(document_typess);
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
exports.getDocument_types = getDocument_types;
/* UPDATE */
const updateDocument_types = async (req, res) => {
    try {
        const document_types = await prisma_1.default.document_types.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(document_types);
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
exports.updateDocument_types = updateDocument_types;
/* DELETE */
const deleteDocument_types = async (req, res) => {
    try {
        await prisma_1.default.document_types.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "document_types deleted successfully" });
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
exports.deleteDocument_types = deleteDocument_types;
