import express from "express";
import {
  deleteFeedback,
  getFeedback,
  submitFeedback,
} from "../controller/feedbackController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, submitFeedback);
router.delete("/:id", verifyToken, deleteFeedback);
router.get("/", getFeedback);
export default router;
