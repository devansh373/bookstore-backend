import mongoose, { Document } from "mongoose";
import crypto from "crypto";

export interface IAuthAccess extends Document {
  username: string;
  email: string;
  password: string;
  phone:string;
  role: "User" | "Admin";
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  getResetPasswordToken: () => string;
}

const AuthAccessSchema = new mongoose.Schema<IAuthAccess>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["User", "Admin"], required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

AuthAccessSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export const AuthAccessModel = mongoose.model<IAuthAccess>("AuthAccess", AuthAccessSchema);