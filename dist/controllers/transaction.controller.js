"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactionCertificate = exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactions = exports.createTransaction = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const supabaseUrl_util_1 = require("../utils/supabaseUrl.util");
const helper_generateCertificate_1 = require("../utils/certificates/helper.generateCertificate");
const crypto_util_1 = require("../utils/crypto.util");
const date_helper_1 = require("../helper/date.helper");
/* CREATE */
const createTransaction = async (req, res) => {
    try {
        const transaction = await prisma_1.default.transaction.create({
            data: req.body,
        });
        res.status(201).json(transaction);
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
exports.createTransaction = createTransaction;
/* READ ALL */
const getTransactions = async (_req, res) => {
    try {
        const transactions = await prisma_1.default.transaction.findMany();
        res.json(transactions);
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
exports.getTransactions = getTransactions;
/* READ ONE */
const getTransactionById = async (req, res) => {
    try {
        const transaction = await prisma_1.default.transaction.findMany({
            where: { resident_id: req.params.resident_id },
            include: {
                certificate: {
                    select: {
                        template_name: true,
                        template_price: true
                    },
                },
            },
        });
        if (!transaction) {
            res.status(404).json({ message: "Transaction not found" });
            return;
        }
        transaction.forEach(tx => {
            if (tx.certificate) {
                tx.certificate.template_name = (0, crypto_util_1.decrypt)(tx.certificate.template_name);
            }
        });
        res.status(200).json(transaction);
    }
    catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : "Unknown error occurred",
        });
    }
};
exports.getTransactionById = getTransactionById;
/* UPDATE */
const updateTransaction = async (req, res) => {
    try {
        const transaction = await prisma_1.default.transaction.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(transaction);
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
exports.updateTransaction = updateTransaction;
/* DELETE */
const deleteTransaction = async (req, res) => {
    try {
        await prisma_1.default.transaction.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "transaction deleted successfully" });
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
exports.deleteTransaction = deleteTransaction;
const generateTransactionCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await prisma_1.default.transaction.findUnique({
            where: { id },
            include: {
                certificate: {
                    select: { template_path: true },
                },
            },
        });
        if (!transaction) {
            res.status(404).json({ error: "Transaction not found" });
            return;
        }
        `x`;
        if (!transaction.details) {
            res.status(400).json({ error: "Certificate data missing" });
            return;
        }
        if (!transaction.certificate?.template_path) {
            res.status(400).json({ error: "Template not configured" });
            return;
        }
        // 🔓 Decrypt + parse JSON
        let certificateData;
        try {
            const decrypted = (0, crypto_util_1.decrypt)(transaction.details);
            certificateData = JSON.parse(decrypted);
            const now = new Date();
            const dayth = (0, date_helper_1.getDayWithSuffix)(now.getDate());
            const month = now.toLocaleString("en-US", { month: "long" });
            const year = now.getFullYear();
            certificateData.issued = `${dayth} day of ${month} ${year}`;
        }
        catch {
            res.status(400).json({ error: "Invalid certificate details format" });
            return;
        }
        const templateUrl = await (0, supabaseUrl_util_1.generateSignedUrl)(transaction.certificate.template_path, 60 * 5);
        if (!templateUrl) {
            res.status(500).json({ error: "Failed to generate template URL" });
            return;
        }
        // 🧾 Generate DOCX buffer (NO FILE SYSTEM)
        const buffer = await (0, helper_generateCertificate_1.generateCertificate)(templateUrl, certificateData);
        // 📥 Force download
        res.setHeader("Content-Disposition", `attachment; filename="certificate-${transaction.id}.docx"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.send(buffer);
        // ✅ Update status (async)
        prisma_1.default.transaction.update({
            where: { id },
            data: { status: "completed" },
        }).catch(console.error);
    }
    catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : "Certificate generation failed",
        });
    }
};
exports.generateTransactionCertificate = generateTransactionCertificate;
