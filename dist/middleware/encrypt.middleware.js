"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptFields = void 0;
const crypto_util_1 = require("../utils/crypto.util");
const encryptFields = (fields) => (req, _res, next) => {
    if (!req.body)
        return next();
    // ✅ CASE 1: ARRAY BODY (bulk)
    if (Array.isArray(req.body)) {
        req.body = req.body.map((item) => {
            const copy = { ...item };
            fields.forEach((field) => {
                if (copy[field] !== undefined && copy[field] !== null) {
                    const value = typeof copy[field] === "object"
                        ? JSON.stringify(copy[field])
                        : String(copy[field]);
                    copy[field] = (0, crypto_util_1.encrypt)(value);
                }
            });
            return copy;
        });
        return next();
    }
    // ✅ CASE 2: OBJECT BODY (create / update)
    const copy = { ...req.body };
    fields.forEach((field) => {
        if (copy[field] !== undefined && copy[field] !== null) {
            const value = typeof copy[field] === "object"
                ? JSON.stringify(copy[field])
                : String(copy[field]);
            copy[field] = (0, crypto_util_1.encrypt)(value);
        }
    });
    req.body = copy;
    next();
};
exports.encryptFields = encryptFields;
