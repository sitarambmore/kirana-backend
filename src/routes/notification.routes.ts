import { Router } from 'express';
import {
    registerDeviceToken,
    sendFestivalOffer,
} from '../controllers/notificationController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Protect endpoints — obviously, a user must be logged in to register their token.
router.use(protect);

// Mobile App endpoint
router.post('/register-token', registerDeviceToken);

// Shopkeeper Admin Panel endpoint
router.post('/broadcast', restrictTo('SHOPKEEPER'), sendFestivalOffer);

export default router;
