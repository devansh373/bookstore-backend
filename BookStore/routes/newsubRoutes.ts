import express, { Router } from "express";
import { sendMessage, sendEmail, getEmailLogs } from "../../Message/controllers/messageController";
import { sendEmailHandler, getSubscribersHandler, deleteSubscriberHandler } from "../controllers/newsubController";
import { isAuthenticated, adminOnly } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.post("/send-message", isAuthenticated, adminOnly, sendMessage);
router.post("/send-email", isAuthenticated, adminOnly, sendEmail);
router.get("/email-logs", isAuthenticated, adminOnly, getEmailLogs);
router.post("/subscribers/send", isAuthenticated, adminOnly, sendEmailHandler);
router.get("/subscribers", isAuthenticated, adminOnly, getSubscribersHandler);
router.delete("/subscribers/:id", isAuthenticated, adminOnly, deleteSubscriberHandler);

export default router;