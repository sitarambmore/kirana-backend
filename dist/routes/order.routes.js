"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect all order routes. You must be logged in to order or view orders.
router.use(auth_1.protect);
router.post('/', orderController_1.createOrder);
router.get('/my-orders', orderController_1.getMyOrders);
// Shopkeeper ONLY Routes
router.use((0, auth_1.restrictTo)('SHOPKEEPER'));
router.get('/all', orderController_1.getAllOrders);
router.put('/:id/status', orderController_1.updateOrderStatus);
exports.default = router;
