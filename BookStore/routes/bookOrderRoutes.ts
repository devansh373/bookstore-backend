// File: orderroutes.ts
import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder, getCancelReasons, cancelOrder } from '../controllers/orderController';
import { isAuthenticated, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/orders', isAuthenticated, createOrder);
router.get('/my-orders', isAuthenticated, getMyOrders);
router.get('/orders', isAuthenticated, adminOnly, getAllOrders);
router.put('/orders/:id', isAuthenticated, adminOnly, updateOrderStatus);
router.delete('/orders/:id', isAuthenticated, adminOnly, deleteOrder);
router.get('/cancel-reasons', isAuthenticated, getCancelReasons);
router.post('/orders/:id/cancel', isAuthenticated, cancelOrder);

export default router;