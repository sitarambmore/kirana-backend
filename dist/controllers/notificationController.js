"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFestivalOffer = exports.registerDeviceToken = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * 1. Register Device Token for Notifications
 * The mobile app gets an FCM token native to the phone, it saves it in our DB for future targeted marketing.
 */
const registerDeviceToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user?.id;
        if (!fcmToken) {
            res.status(400).json({ status: 'fail', message: 'Token is required' });
            return;
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { fcmToken },
        });
        res.status(200).json({ status: 'success', message: 'Token registered successfully' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to register device token' });
    }
};
exports.registerDeviceToken = registerDeviceToken;
/**
 * 2. Send Broadcast Notification (Shopkeeper Only - Festival Offers)
 * Sends a notification to ALL users who have an fcmToken registered in the DB.
 */
const sendFestivalOffer = async (req, res) => {
    try {
        const { title, body } = req.body;
        // Fetch all users that have a device token
        const usersWithTokens = await prisma_1.default.user.findMany({
            where: {
                fcmToken: { not: null },
            },
            select: { fcmToken: true },
        });
        const tokens = usersWithTokens.map((u) => u.fcmToken);
        if (tokens.length === 0) {
            res.status(400).json({ status: 'fail', message: 'No devices found to send notifications to' });
            return;
        }
        // Attempting Send
        if (firebase_1.default.apps.length === 0) {
            console.warn("FCM MOCK: Sending multicast notification", { tokens, title, body });
            res.status(200).json({ status: 'success', message: 'FCM mocked successful (not initialized)' });
            return;
        }
        const response = await firebase_1.default.messaging().sendEachForMulticast({
            tokens,
            notification: {
                title,
                body,
            },
        });
        res.status(200).json({
            status: 'success',
            message: `Notification sent. Success count: ${response.successCount}, Failure count: ${response.failureCount}`,
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to broadcast notification' });
    }
};
exports.sendFestivalOffer = sendFestivalOffer;
