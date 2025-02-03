import express from "express";
import { Chat } from "../models/chat.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  changeMessageStatus,
  getChatMessages,
} from "../controller/messageController.js";
const router = express.Router();

router.get("/:id", verifyToken, getChatMessages);
router.put("/status/:id", verifyToken, changeMessageStatus);
export default router;
