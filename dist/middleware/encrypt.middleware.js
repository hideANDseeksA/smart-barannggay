"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptFields = void 0;
const crypto_util_1 = require("../utils/crypto.util");
const encryptFields = (fields) => (req, _res, next) => {
    if (!req.body)
        return next();
    fields.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === "string") {
            req.body[field] = (0, crypto_util_1.encrypt)(req.body[field]);
        }
    });
    next();
};
exports.encryptFields = encryptFields;
