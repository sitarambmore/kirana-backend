import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { razorpay } from '../config/razorpay';
import { config } from '../config/env';

/**
 * 1. Create a Razorpay Order
 * This happens before the frontend calls the actual payment gateway modal.
 */
export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.body; // Your internal database order ID
        const userId = req.user?.id;

        if (!orderId) {
            res.status(400).json({ status: 'fail', message: 'Order ID is required' });
            return;
        }

        // Find the internal order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        // Make sure user owns this order
        if (order.userId !== userId) {
            res.status(403).json({ status: 'fail', message: 'Unauthorized to pay for this order' });
            return;
        }

        // Razorpay amount is in heavily scaled subunits (paise for INR), so multiply by 100
        const options = {
            amount: Math.round(order.totalAmount * 100),
            currency: 'INR',
            receipt: `receipt_order_${order.id.slice(0, 10)}`, // Shorten to fit max lengths
        };

        // 🚨 MOCK RAZORPAY FOR LOCAL TESTING 🚨
        // Real Razorpay needs live API accounts. Without it, the App crashes here.
        let razorpayOrderId = `mock_order_${Date.now()}`;
        let razorpayOrderDetails = { id: razorpayOrderId, amount: options.amount };
        
        try {
            if (config.payment.razorpayKeyId && config.payment.razorpayKeyId.length > 5) {
                const response = await razorpay.orders.create(options);
                razorpayOrderId = response.id;
                razorpayOrderDetails = response as any;
            }
        } catch (razorpayErr: any) {
            console.warn('Razorpay mock activated: Live keys missing/invalid');
        }

        // Save the payment intent locally
        await prisma.payment.create({
            data: {
                orderId: order.id,
                razorpayId: razorpayOrderId,
                amount: order.totalAmount,
                status: 'PENDING',
            },
        });

        res.status(200).json({
            status: 'success',
            data: {
                razorpayOrder: razorpayOrderDetails,
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Payment initiation failed' });
    }
};

/**
 * 2. Verify Payment Signature
 * This is called by the frontend immediately after the user finishes paying in the Razorpay UI.
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ status: 'fail', message: 'Missing payment verification details' });
            return;
        }

        // Reconstruct the expected signature
        const bodyText = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', config.payment.razorpayKeySecret)
            .update(bodyText.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            res.status(400).json({ status: 'fail', message: 'Payment signature verification failed' });
            return;
        }

        // Find the pending payment intent
        const payment = await prisma.payment.findUnique({
            where: { razorpayId: razorpay_order_id },
        });

        if (!payment) {
            res.status(404).json({ status: 'fail', message: 'Payment record not found' });
            return;
        }

        // Update payment record to SUCCESS
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'SUCCESS',
                paymentMethod: 'ONLINE', // Could be expanded depending on razorpay hook
            },
        });

        // Update the overarching Order status to CONFIRMED
        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'CONFIRMED' },
        });

        res.status(200).json({
            status: 'success',
            message: 'Payment verified successfully',
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Payment verification failed' });
    }
};
