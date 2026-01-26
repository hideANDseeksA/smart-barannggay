"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketEvents = void 0;
const socket_auth_1 = require("./socket.auth");
const socket_helper_1 = require("./socket.helper");
const registerSocketEvents = (io) => {
    io.use(socket_auth_1.socketAuth);
    io.on("connection", (socket) => {
        const user = socket.user;
        console.log(`Socket connected: ${user.id} (${user.role})`);
        // 🔐 Auto join rooms
        if (user.role === "admin" || user.role === "staff") {
            socket.join(socket_helper_1.ADMIN_ROOM);
        }
        if (user.role === "resident") {
            socket.join((0, socket_helper_1.residentRoom)(user.id));
        }
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
};
exports.registerSocketEvents = registerSocketEvents;
