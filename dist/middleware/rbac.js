"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbac = void 0;
/**
 * Role-Based Access Control Middleware
 * @param allowedRoles list of allowed roles
 */
const rbac = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
            error: "Forbidden: insufficient permissions",
        });
        return;
    }
    next();
};
exports.rbac = rbac;
