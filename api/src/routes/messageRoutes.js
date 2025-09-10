import express from "express";
import { handleGetUsers, handleGetMessages, handleSendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users" , protectRoute, handleGetUsers);
router.get("/:id" , protectRoute, handleGetMessages);
router.post("/send/:id", protectRoute, handleSendMessage);

export default router;