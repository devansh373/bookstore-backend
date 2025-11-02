import { Request, Response, RequestHandler } from "express";
import { Subscriber, SubscriberType } from "../models/newsub";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendSubscriberEmail = async (
  subscriber: any,
  subject: string,
  body: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Harsh Pages Bookstore" <${process.env.EMAIL_USER}>`,
      to: subscriber.email,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};


export const sendEmailHandler: RequestHandler = async (req, res) => {
  const { name, email, subject, body } = req.body;

  if (!name || !email || !subject || !body) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const subscriber: SubscriberType = new Subscriber({ name, email });
    await subscriber.save();

    const result = await sendSubscriberEmail(subscriber, subject, body);

    if (result.success) {
      res.status(201).json({ message: "Subscriber added and email sent successfully" });
    } else {
      res.status(500).json({ message: result.message || "Failed to send email" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getSubscribersHandler: RequestHandler = async (_req: Request, res: Response) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteSubscriberHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Subscriber.findByIdAndDelete(id);
    res.status(200).json({ message: "Subscriber deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};