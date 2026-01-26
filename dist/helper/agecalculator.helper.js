"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = void 0;
const calculateAge = (birthDate) => {
    if (!birthDate)
        return null;
    const dob = new Date(birthDate);
    // Invalid date safety check
    if (isNaN(dob.getTime()))
        return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age >= 0 ? age : null;
};
exports.calculateAge = calculateAge;
