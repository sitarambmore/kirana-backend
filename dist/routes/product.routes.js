"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Publicly accessible routes (Customers & Visitors can view products)
router.get('/', productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
// Protected routes (Only Shopkeepers can modify inventory)
router.use(auth_1.protect); // Apply protection to all routes below this line
router.use((0, auth_1.restrictTo)('SHOPKEEPER'));
router.post('/', productController_1.createProduct);
router.put('/:id', productController_1.updateProduct);
router.delete('/:id', productController_1.deleteProduct);
exports.default = router;
