"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const residentIdGenerator_1 = require("./middleware/residentIdGenerator");
dotenv_1.default.config();
// PrismaClient automatically uses `directUrl` from schema.prisma
const prisma = new client_1.PrismaClient();
prisma.$use(residentIdGenerator_1.residentIdGenerator);
exports.default = prisma;
