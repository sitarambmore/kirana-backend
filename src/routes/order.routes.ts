import { Router } from 'express';
import {
    createOrder,
    getAllOrders,
    getMyOrders,
    updateOrderStatus,
} from '../controllers/orderController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Protect all order routes. You must be logged in to order or view orders.
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

// Shopkeeper ONLY Routes
router.use(restrictTo('SHOPKEEPER'));
router.get('/all', getAllOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
