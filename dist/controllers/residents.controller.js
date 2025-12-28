"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResident = exports.updateResident = exports.getResidentById = exports.getResidents = exports.createResident = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/* CREATE */
const createResident = async (req, res) => {
    try {
        const resident = await prisma_1.default.residents.create({
            data: req.body,
        });
        res.status(201).json(resident);
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
exports.createResident = createResident;
/* READ ALL */
const getResidents = async (_req, res) => {
    try {
        const residents = await prisma_1.default.residents.findMany();
        res.json(residents);
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
exports.getResidents = getResidents;
/* READ ONE */
const getResidentById = async (req, res) => {
    try {
        const resident = await prisma_1.default.residents.findUnique({
            where: { id: req.params.id },
        });
        if (!resident) {
            res.status(404).json({ message: "Resident not found" });
            return;
        }
        res.json(resident);
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
exports.getResidentById = getResidentById;
/* UPDATE */
const updateResident = async (req, res) => {
    try {
        const resident = await prisma_1.default.residents.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(resident);
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
exports.updateResident = updateResident;
/* DELETE */
const deleteResident = async (req, res) => {
    try {
        await prisma_1.default.residents.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "Resident deleted successfully" });
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
exports.deleteResident = deleteResident;
