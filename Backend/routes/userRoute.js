import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

import {
  deleteUser,
  getCurrentUser,
  updateUser,
  getAllUsers,
  ChangeRole,
  uploadProfile_pic,
} from "../controller/userController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();
router.put("/role", ChangeRole);
router.get("/", getAllUsers);
router.delete("/:id", deleteUser);
router.put("/edit/", upload.single("profile_pic"), uploadProfile_pic);
router.put("/edit/profile", updateUser);

router.get("/me", getCurrentUser);

export default router;
