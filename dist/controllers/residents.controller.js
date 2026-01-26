"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResident = exports.updateResident = exports.getResidentById = exports.getResidents = exports.createResident = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const prisma_helper_1 = require("../helper/prisma.helper");
const crypto_util_1 = require("../utils/crypto.util");
const agecalculator_helper_1 = require("../helper/agecalculator.helper");
/* CREATE */
const createResident = async (req, res) => {
    try {
        // Convert b_date to full ISO string if present
        const data = {
            ...req.body,
            b_date: req.body.b_date ? new Date(req.body.b_date).toISOString() : null,
        };
        // Prisma middleware will auto-generate resident_id
        const resident = await prisma_1.default.residents.create({
            data,
        });
        res.status(201).json(resident);
    }
    catch (err) {
        (0, prisma_helper_1.handlePrismaError)(err, res);
    }
};
exports.createResident = createResident;
/* READ ALL */
const getResidents = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 50, 1);
        const skip = (page - 1) * limit;
        const [residents, total] = await Promise.all([
            prisma_1.default.residents.findMany({
                skip,
                take: limit,
                include: {
                    purok: {
                        select: {
                            name: true
                        }
                    },
                }
            }),
            prisma_1.default.residents.count(),
        ]);
        const decryptedResidents = (0, crypto_util_1.decryptAll)(residents);
        const residentsWithAge = decryptedResidents.map((resident) => ({
            ...resident,
            age: (0, agecalculator_helper_1.calculateAge)(resident.b_date),
        }));
        res.json({
            residents: residentsWithAge,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (err) {
        (0, prisma_helper_1.handlePrismaError)(err, res);
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
        (0, prisma_helper_1.handlePrismaError)(err, res);
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
        (0, prisma_helper_1.handlePrismaError)(err, res);
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
        (0, prisma_helper_1.handlePrismaError)(err, res);
    }
};
exports.deleteResident = deleteResident;
