import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server , {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
});

//storing online user
const userSocketMap = {};

export function getRecieverSocketId(userId){
    return userSocketMap[userId];
}

io.on("connection" , (socket)=>{
    
    console.log("User connected" , socket.id );
    const userId = socket.handshake.query.userId;
    

    if(userId) userSocketMap[userId] = socket.id;
    else console.log("User id not found");
    //broadcast event
    io.emit("onlineUsers" , Object.keys(userSocketMap));

    socket.on("disconnect" , ()=>{
        console.log("User disconnected" , socket.id);
        delete userSocketMap[userId];
        io.emit("onlineUsers" , Object.keys(userSocketMap));
    })
})

export {io , app , server};