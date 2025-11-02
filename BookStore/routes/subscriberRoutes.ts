import express from 'express';
import {
  getSubscribers,
  addSubscriber,
  updateSubscriberStatus,
  updateNotificationSettings,
  deleteSubscriber
} from '../controllers/subscriberController';

const router = express.Router();

router.get('/', getSubscribers);
router.post('/', addSubscriber);
router.put('/:id/status', updateSubscriberStatus);
router.put('/:id/notifications', updateNotificationSettings);
router.delete('/:id', deleteSubscriber);

export default router;