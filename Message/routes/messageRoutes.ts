import express, { Router } from 'express';
import { sendMessage, sendEmail } from '../controllers/messageController';

const router: Router = express.Router();

router.post('/send-message', sendMessage);
router.post('/send-email', sendEmail);

export default router;
