"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePurok = exports.updatePurok = exports.getPurok = exports.createPurok = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/* CREATE */
const createPurok = async (req, res) => {
    try {
        const purok = await prisma_1.default.purok.create({
            data: req.body,
        });
        res.status(201).json(purok);
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
exports.createPurok = createPurok;
/* READ ALL */
const getPurok = async (_req, res) => {
    try {
        const puroks = await prisma_1.default.purok.findMany();
        res.json(puroks);
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
exports.getPurok = getPurok;
/* UPDATE */
const updatePurok = async (req, res) => {
    try {
        const purok = await prisma_1.default.purok.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(purok);
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
exports.updatePurok = updatePurok;
/* DELETE */
const deletePurok = async (req, res) => {
    try {
        await prisma_1.default.purok.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "purok deleted successfully" });
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
exports.deletePurok = deletePurok;
