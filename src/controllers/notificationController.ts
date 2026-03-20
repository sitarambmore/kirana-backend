import { Request, Response } from 'express';
import admin from '../config/firebase';
import prisma from '../config/prisma';

/**
 * 1. Register Device Token for Notifications
 * The mobile app gets an FCM token native to the phone, it saves it in our DB for future targeted marketing.
 */
export const registerDeviceToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user?.id;

        if (!fcmToken) {
            res.status(400).json({ status: 'fail', message: 'Token is required' });
            return;
        }

        await prisma.user.update({
            where: { id: userId as string },
            data: { fcmToken },
        });

        res.status(200).json({ status: 'success', message: 'Token registered successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to register device token' });
    }
};

/**
 * 2. Send Broadcast Notification (Shopkeeper Only - Festival Offers)
 * Sends a notification to ALL users who have an fcmToken registered in the DB.
 */
export const sendFestivalOffer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, body } = req.body;

        // Fetch all users that have a device token
        const usersWithTokens = await prisma.user.findMany({
            where: {
                fcmToken: { not: null },
            },
            select: { fcmToken: true },
        });

        const tokens = usersWithTokens.map((u: any) => u.fcmToken as string);

        if (tokens.length === 0) {
            res.status(400).json({ status: 'fail', message: 'No devices found to send notifications to' });
            return;
        }

        // Attempting Send
        if (admin.apps.length === 0) {
            console.warn("FCM MOCK: Sending multicast notification", { tokens, title, body });
            res.status(200).json({ status: 'success', message: 'FCM mocked successful (not initialized)' });
            return;
        }

        const response = await admin.messaging().sendEachForMulticast({
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
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to broadcast notification' });
    }
};
