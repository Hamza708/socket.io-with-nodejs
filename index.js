import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const connectedUsers = {};

io.on("connection", (socket) => {
    socket.on("user-join", (userId) => {
        connectedUsers[userId] = socket;
    });

    socket.on("user-message", ({ recipientUserId, message, userId }) => {
        const targetSocket = connectedUsers[recipientUserId];
        if (targetSocket) {
            targetSocket.emit("message", { sender: userId, message });
        }
        socket.emit("message", { sender: userId, message });
    });

    socket.on("disconnect", () => {
        for (const [userId, userSocket] of Object.entries(connectedUsers)) {
            if (userSocket === socket) {
                delete connectedUsers[userId];
                break;
            }
        }
    });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(9000, () => console.log("Server listening on 9000"));
