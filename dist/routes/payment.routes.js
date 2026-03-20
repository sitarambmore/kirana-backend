"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect endpoints — obviously, one must be logged in to pay.
router.use(auth_1.protect);
router.post('/create', paymentController_1.createPaymentOrder);
router.post('/verify', paymentController_1.verifyPayment);
exports.default = router;
