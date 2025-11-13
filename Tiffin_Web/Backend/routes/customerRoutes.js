import express from 'express';
import { 
  getCustomers, 
  blockCustomer, 
  updateProfile, 
  changePassword,
  getProfile 
} from '../controllers/customerController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// View all customers (admin only)
router.get('/', authMiddleware, roleMiddleware(['admin']), getCustomers);

// Get customer profile (customer can get own profile)
router.get('/me', authMiddleware, getProfile);
router.get('/:id', authMiddleware, getProfile);

// Update customer profile (customer can update own profile)
router.put('/:id', authMiddleware, updateProfile);

// Change password (customer can change own password)
router.put('/:id/change-password', authMiddleware, changePassword);

// Block a customer (admin only)
router.patch('/:id/block', authMiddleware, roleMiddleware(['admin']), blockCustomer);

export default router;