"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHealth_record = exports.updateHealth_record = exports.getHealth_recordById = exports.getHealth_records = exports.createHealth_record = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/* CREATE */
const createHealth_record = async (req, res) => {
    try {
        const health_record = await prisma_1.default.health_records.create({
            data: req.body,
        });
        res.status(201).json(health_record);
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
exports.createHealth_record = createHealth_record;
/* READ ALL */
const getHealth_records = async (_req, res) => {
    try {
        const health_records = await prisma_1.default.health_records.findMany();
        res.json(health_records);
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
exports.getHealth_records = getHealth_records;
/* READ ONE */
const getHealth_recordById = async (req, res) => {
    try {
        const health_record = await prisma_1.default.health_records.findMany({
            where: { resident_id: req.params.id },
        });
        if (!health_record) {
            res.status(404).json({ message: "health_record not found" });
            return;
        }
        res.json(health_record);
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
exports.getHealth_recordById = getHealth_recordById;
/* UPDATE */
const updateHealth_record = async (req, res) => {
    try {
        const health_record = await prisma_1.default.health_records.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(health_record);
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
exports.updateHealth_record = updateHealth_record;
/* DELETE */
const deleteHealth_record = async (req, res) => {
    try {
        await prisma_1.default.health_records.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "health_record deleted successfully" });
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
exports.deleteHealth_record = deleteHealth_record;
