import express from 'express';
import { createOrderItem } from '../controllers/orderItemController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Customer adds items to order
router.post('/', authMiddleware, roleMiddleware(['customer']), createOrderItem);

export default router;
