import { Request, Response } from "express";
import { otpStore } from "./otpController";

export const verifyOtp = (req: Request, res: Response): void => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ message: "Email and OTP are required" });
    return;
  }

  const storedOtp = otpStore.get(email);

  if (storedOtp === otp) {
    otpStore.delete(email); // Optional cleanup
    res.status(200).json({ message: "OTP verified successfully" });
  } else {
    res.status(401).json({ message: "Invalid OTP" });
  }
};
