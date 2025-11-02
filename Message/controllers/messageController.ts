
import { Request, Response, RequestHandler } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";

dotenv.config();

interface MessageEntry {
  number: string;
  message: string;
  timestamp: number;
}

let messageLog: MessageEntry[] = [];


interface EmailLogDocument extends Document {
  subject: string;
  recipients: string[];
  status: "success" | "failed";
  timestamp: Date;
  error?: string;
}

const emailLogSchema = new mongoose.Schema<EmailLogDocument>({
  subject: { type: String, required: true },
  recipients: [{ type: String, required: true }],
  status: { type: String, enum: ["success", "failed"], required: true },
  timestamp: { type: Date, default: Date.now },
  error: { type: String },
});

const EmailLog: Model<EmailLogDocument> = mongoose.model<EmailLogDocument>("EmailLog", emailLogSchema);


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { number, message } = req.body;

  if (!number || !message) {
    res.status(400).json({ error: "Number and message are required" });
    return;
  }

  try {
    messageLog.push({ number, message, timestamp: Date.now() });
    res.status(200).json({ success: true, message: "Message 'sent' successfully (simulation)." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send message", details: error.message });
  }
};

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
  const { subject, body, recipients } = req.body;

  if (!subject || !body || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    res.status(400).json({ message: "Subject, body, and recipients are required" });
    return;
  }

  try {
    const results = [];
    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: `"Harsh Bookstore" <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          text: body,
        });
        results.push({ email, success: true });
      } catch (error: any) {
        results.push({ email, success: false, message: error.message });
      }
    }

    const success = results.every((r) => r.success);
    const emailLog = new EmailLog({
      subject,
      recipients,
      status: success ? "success" : "failed",
      error: success ? undefined : results.find((r) => !r.success)?.message,
    });
    await emailLog.save();

    if (success) {
      res.status(200).json({ message: "Emails sent successfully" });
    } else {
      res.status(500).json({ message: "Some emails failed to send", errors: results });
    }
  } catch (error: any) {
    const emailLog = new EmailLog({
      subject,
      recipients,
      status: "failed",
      error: error.message,
    });
    await emailLog.save();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getEmailLogs: RequestHandler = async (_req: Request, res: Response) => {
  try {
    const logs = await EmailLog.find().sort({ timestamp: -1 });
    res.status(200).json(
      logs.map((log) => ({
        id: log._id,
        subject: log.subject,
        recipients: log.recipients,
        status: log.status,
        timestamp: log.timestamp,
        error: log.error,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};