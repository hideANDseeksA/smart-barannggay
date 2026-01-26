"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.residentIdGenerator = void 0;
const prisma_1 = __importDefault(require("../../src/prisma"));
const residentIdGenerator = async (params, next) => {
    // Only run on create of "residents"
    if (params.model === "residents" && params.action === "create") {
        let systemSetting = await prisma_1.default.system_setting.findFirst();
        if (!systemSetting) {
            systemSetting = await prisma_1.default.system_setting.create({
                data: {
                    residentPrefix: "T-",
                    residentNumberType: "sequential",
                    residentNumberLength: 6,
                    residentNumber: 0,
                },
            });
        }
        const { residentPrefix, residentNumber, residentNumberLength, residentNumberType, id, } = systemSetting;
        let newNumber;
        if (residentNumberType === "sequential") {
            newNumber = residentNumber + 1;
        }
        else if (residentNumberType === "random") {
            const min = 10 ** (residentNumberLength - 1);
            const max = 10 ** residentNumberLength - 1;
            newNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else {
            throw new Error("Invalid residentNumberType");
        }
        const numberString = newNumber
            .toString()
            .padStart(residentNumberLength, "0");
        params.args.data.resident_id = `${residentPrefix}${numberString}`;
        if (residentNumberType === "sequential") {
            await prisma_1.default.system_setting.update({
                where: { id },
                data: { residentNumber: newNumber },
            });
        }
    }
    return next(params);
};
exports.residentIdGenerator = residentIdGenerator;
