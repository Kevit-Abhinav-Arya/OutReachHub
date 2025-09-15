import express from "express";
import {
  adminLogin,
  userLogin,
  selectWorkspace,
  logout,
} from "../Controller/authController";
import { verifyToken } from "../Middlewares/authMiddleware";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/user/login", userLogin);
router.post("/user/select-workspace", selectWorkspace);
router.post("/logout", verifyToken, logout);

export default router;
