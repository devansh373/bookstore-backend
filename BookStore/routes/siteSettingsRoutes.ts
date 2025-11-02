import express from 'express';
import {
  createSettings,
  getSettings,
  updateSettings,
  deleteSettings
} from '../controllers/siteSettingsController';
import { isAuthenticated, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/settings', isAuthenticated, adminOnly, createSettings);
router.get('/settings', getSettings);
router.put('/settings', isAuthenticated, adminOnly, updateSettings);
router.delete('/settings', isAuthenticated, adminOnly, deleteSettings);

export default router;