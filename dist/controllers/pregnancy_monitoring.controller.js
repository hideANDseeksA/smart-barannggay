"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePregnancy_monitoring = exports.updatePregnancy_monitoring = exports.getPregnancy_monitoringById = exports.getPregnancy_monitoring = exports.createPregnancy_monitoring = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const crypto_util_1 = require("../utils/crypto.util");
/* CREATE */
const createPregnancy_monitoring = async (req, res) => {
    try {
        const pregnancy_monitoring = await prisma_1.default.pregnancy_monitoring.create({
            data: req.body,
        });
        res.status(201).json(pregnancy_monitoring);
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
exports.createPregnancy_monitoring = createPregnancy_monitoring;
/* READ ALL */
const getPregnancy_monitoring = async (_req, res) => {
    try {
        const pregnancy_monitoring = await prisma_1.default.pregnancy_monitoring.findMany({
            include: {
                health_record: {
                    include: {
                        resident: true
                    }
                }
            },
            orderBy: {
                created_at: "desc" // optional but recommended
            }
        });
        // Decrypt first
        const decryptedData = pregnancy_monitoring.map(pm => {
            if (!pm.health_record)
                return pm;
            const hr = pm.health_record;
            const resident = hr.resident;
            return {
                ...pm,
                health_record: {
                    ...hr,
                    blood_type: hr.blood_type ? (0, crypto_util_1.decrypt)(hr.blood_type) : null,
                    allergies: hr.allergies ? (0, crypto_util_1.decrypt)(hr.allergies) : null,
                    chronic_conditions: hr.chronic_conditions ? (0, crypto_util_1.decrypt)(hr.chronic_conditions) : null,
                    resident: resident
                        ? {
                            id: resident.id,
                            resident_id: resident.resident_id,
                            f_name: resident.f_name ? (0, crypto_util_1.decrypt)(resident.f_name) : null,
                            l_name: resident.l_name ? (0, crypto_util_1.decrypt)(resident.l_name) : null,
                            m_name: resident.m_name ? (0, crypto_util_1.decrypt)(resident.m_name) : null,
                        }
                        : null
                }
            };
        });
        // 🔹 GROUP BY health_record_id
        const groupedData = decryptedData.reduce((acc, pm) => {
            const healthId = pm.health_record_id;
            if (!acc[healthId]) {
                acc[healthId] = {
                    health_record_id: healthId,
                    health_record: pm.health_record,
                    monitoring_records: []
                };
            }
            acc[healthId].monitoring_records.push({
                ...pm,
                health_record: undefined // avoid duplication
            });
            return acc;
        }, {});
        res.json(Object.values(groupedData));
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
exports.getPregnancy_monitoring = getPregnancy_monitoring;
/* READ ONE */
const getPregnancy_monitoringById = async (req, res) => {
    try {
        const pregnancy_monitoring = await prisma_1.default.pregnancy_monitoring.findMany({
            where: { health_record_id: req.params.id },
        });
        if (!pregnancy_monitoring) {
            res.status(404).json({ message: "pregnancy_monitoring not found" });
            return;
        }
        res.json(pregnancy_monitoring);
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
exports.getPregnancy_monitoringById = getPregnancy_monitoringById;
/* UPDATE */
const updatePregnancy_monitoring = async (req, res) => {
    try {
        const pregnancy_monitoring = await prisma_1.default.pregnancy_monitoring.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(pregnancy_monitoring);
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
exports.updatePregnancy_monitoring = updatePregnancy_monitoring;
/* DELETE */
const deletePregnancy_monitoring = async (req, res) => {
    try {
        await prisma_1.default.pregnancy_monitoring.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "pregnancy_monitoring deleted successfully" });
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
exports.deletePregnancy_monitoring = deletePregnancy_monitoring;
