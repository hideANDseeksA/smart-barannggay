"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHealthAppointment = exports.updateHealthAppointment = exports.getHealthAppointmentById = exports.getHealthAppointments = exports.createHealthAppointment = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/* CREATE */
const createHealthAppointment = async (req, res) => {
    try {
        const healthAppointment = await prisma_1.default.health_appointments.create({
            data: req.body,
        });
        res.status(201).json(healthAppointment);
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
exports.createHealthAppointment = createHealthAppointment;
/* READ ALL */
const getHealthAppointments = async (_req, res) => {
    try {
        const healthAppointments = await prisma_1.default.health_appointments.findMany();
        res.json(healthAppointments);
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
exports.getHealthAppointments = getHealthAppointments;
/* READ ONE */
const getHealthAppointmentById = async (req, res) => {
    try {
        const healthAppointment = await prisma_1.default.health_appointments.findUnique({
            where: { id: req.params.id },
        });
        if (!healthAppointment) {
            res.status(404).json({ message: "Health appointment not found" });
            return;
        }
        res.json(healthAppointment);
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
exports.getHealthAppointmentById = getHealthAppointmentById;
/* UPDATE */
const updateHealthAppointment = async (req, res) => {
    try {
        const healthAppointment = await prisma_1.default.health_appointments.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(healthAppointment);
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
exports.updateHealthAppointment = updateHealthAppointment;
/* DELETE */
const deleteHealthAppointment = async (req, res) => {
    try {
        await prisma_1.default.health_appointments.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "Health appointment deleted successfully" });
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
exports.deleteHealthAppointment = deleteHealthAppointment;
