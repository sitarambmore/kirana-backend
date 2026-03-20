import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = Router();

// Protect endpoints — obviously, one must be logged in to pay.
router.use(protect);

router.post('/create', createPaymentOrder);
router.post('/verify', verifyPayment);

export default router;
