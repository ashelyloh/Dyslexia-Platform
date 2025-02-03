import express from "express";
import {
  ADD_USER_TO_GROUP,
  createChat,
  deleteChat,
  getAllChat,
} from "../controller/chatController.js";
import { upload } from "../middleware/ChatLogo.js";

const router = express.Router();

router.get("/chats", getAllChat);
router.post("/create", upload.single("logo"), createChat);
router.delete("/:id", deleteChat);
router.put("/add/user/:id", ADD_USER_TO_GROUP);
export default router;
