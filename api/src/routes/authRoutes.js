import express from "express";
import { handlelogin, handlesignup, handlelogout, handleupdateProfilePic, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/login", handlelogin);
router.post("/signup" ,handlesignup);
router.post("/logout", handlelogout);

router.put("/update-profilePic", protectRoute , handleupdateProfilePic);
router.get("/check-auth", protectRoute, checkAuth);

export default router;