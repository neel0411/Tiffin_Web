import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Auth Routes
// URL: POST /api/auth/register
router.post('/register', register);

// URL: POST /api/auth/login
router.post('/login', login);



export default router;
