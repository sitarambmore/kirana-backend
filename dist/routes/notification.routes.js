"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect endpoints — obviously, a user must be logged in to register their token.
router.use(auth_1.protect);
// Mobile App endpoint
router.post('/register-token', notificationController_1.registerDeviceToken);
// Shopkeeper Admin Panel endpoint
router.post('/broadcast', (0, auth_1.restrictTo)('SHOPKEEPER'), notificationController_1.sendFestivalOffer);
exports.default = router;
