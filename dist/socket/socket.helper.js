"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitTransactionCompleted = exports.emitTransactionUpdate = exports.emitNewTransactionToAdmins = exports.residentRoom = exports.ADMIN_ROOM = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
/* =============================
   INIT
============================= */
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: { origin: "*" },
    });
    return io;
};
exports.initSocket = initSocket;
/* =============================
   GET INSTANCE
============================= */
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
exports.getIO = getIO;
/* =============================
   ROOM HELPERS
============================= */
/** Admin + Staff room */
exports.ADMIN_ROOM = "admins";
/** Resident private room */
const residentRoom = (residentId) => `resident:${residentId}`;
exports.residentRoom = residentRoom;
/* =============================
   EMIT HELPERS
============================= */
/**
 * Emit new transaction (admins only)
 */
const emitNewTransactionToAdmins = (payload) => {
    (0, exports.getIO)().to(exports.ADMIN_ROOM).emit("transaction:new", payload);
};
exports.emitNewTransactionToAdmins = emitNewTransactionToAdmins;
/**
 * Emit transaction update to a specific resident
 */
const emitTransactionUpdate = (residentId, payload) => {
    const io = (0, exports.getIO)();
    // 🔔 Admins & staff
    io.to(exports.ADMIN_ROOM).emit("transaction:update", payload);
    // 🔔 Specific resident
    io.to((0, exports.residentRoom)(residentId)).emit("transaction:update", payload);
};
exports.emitTransactionUpdate = emitTransactionUpdate;
/**
 * Emit transaction completion
 */
const emitTransactionCompleted = (residentId, transactionId) => {
    const io = (0, exports.getIO)();
    io.to(exports.ADMIN_ROOM).emit("transaction:completed", {
        transactionId,
    });
    io.to((0, exports.residentRoom)(residentId)).emit("transaction:completed", {
        transactionId,
        status: "completed",
    });
};
exports.emitTransactionCompleted = emitTransactionCompleted;
