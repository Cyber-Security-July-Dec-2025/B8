import express from "express"; 
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import connect from "./database/connect.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app , server} from "./lib/socket.js";
dotenv.config();


const PORT = process.env.PORT || 8000;

connect();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});