"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptFields = void 0;
const crypto_util_1 = require("../utils/crypto.util");
const decryptFields = (fields) => (_req, res, next) => {
    const oldJson = res.json.bind(res);
    res.json = (data) => {
        if (!data)
            return oldJson(data);
        const decryptObject = (obj) => {
            fields.forEach((field) => {
                if (obj[field] && typeof obj[field] === "string") {
                    try {
                        obj[field] = (0, crypto_util_1.decrypt)(obj[field]);
                    }
                    catch {
                        /* ignore if not encrypted */
                    }
                }
            });
        };
        if (Array.isArray(data)) {
            data.forEach(decryptObject);
        }
        else {
            decryptObject(data);
        }
        return oldJson(data);
    };
    next();
};
exports.decryptFields = decryptFields;
