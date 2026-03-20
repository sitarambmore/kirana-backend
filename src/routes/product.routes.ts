import { Router } from 'express';
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    updateProduct,
} from '../controllers/productController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Publicly accessible routes (Customers & Visitors can view products)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (Only Shopkeepers can modify inventory)
router.use(protect); // Apply protection to all routes below this line
router.use(restrictTo('SHOPKEEPER'));

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
