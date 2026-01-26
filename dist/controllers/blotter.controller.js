"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlotter = exports.updateBlotter = exports.getbBlotter = exports.createBlotter = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/* CREATE */
const createBlotter = async (req, res) => {
    try {
        const blotter = await prisma_1.default.blotter.create({
            data: req.body,
        });
        res.status(201).json(blotter);
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
exports.createBlotter = createBlotter;
/* READ ALL */
const getbBlotter = async (_req, res) => {
    try {
        const blotters = await prisma_1.default.blotter.findMany();
        res.json(blotters);
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
exports.getbBlotter = getbBlotter;
/* UPDATE */
const updateBlotter = async (req, res) => {
    try {
        const blotter = await prisma_1.default.blotter.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(blotter);
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
exports.updateBlotter = updateBlotter;
/* DELETE */
const deleteBlotter = async (req, res) => {
    try {
        await prisma_1.default.blotter.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "blotter deleted successfully" });
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
exports.deleteBlotter = deleteBlotter;
