"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.hashData = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
const hashData = async (data) => {
    return bcryptjs_1.default.hash(data, SALT_ROUNDS);
};
exports.hashData = hashData;
const compareHash = async (plain, hashed) => {
    return bcryptjs_1.default.compare(plain, hashed);
};
exports.compareHash = compareHash;
