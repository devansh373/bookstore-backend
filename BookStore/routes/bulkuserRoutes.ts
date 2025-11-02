import express from 'express';
import { bulkCreateUser, signup, login } from '../controllers/UserController';
import { isAuthenticated, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/users/bulk', isAuthenticated, adminOnly, bulkCreateUser);
router.post('/signup', isAuthenticated, adminOnly, signup);
router.post('/login', isAuthenticated, adminOnly, login);

export default router;
