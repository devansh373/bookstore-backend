import express from "express";
import { sendOtp } from "../controllers/otpController";
import { verifyOtp } from "../controllers/verifyOtp";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp); // New route for verification

export default router;
