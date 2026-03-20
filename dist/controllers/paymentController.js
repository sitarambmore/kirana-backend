"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../config/prisma"));
const razorpay_1 = require("../config/razorpay");
const env_1 = require("../config/env");
/**
 * 1. Create a Razorpay Order
 * This happens before the frontend calls the actual payment gateway modal.
 */
const createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body; // Your internal database order ID
        const userId = req.user?.id;
        if (!orderId) {
            res.status(400).json({ status: 'fail', message: 'Order ID is required' });
            return;
        }
        // Find the internal order
        const order = await prisma_1.default.order.findUnique({
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
        const razorpayOrder = await razorpay_1.razorpay.orders.create(options);
        // Save the payment intent locally
        await prisma_1.default.payment.create({
            data: {
                orderId: order.id,
                razorpayId: razorpayOrder.id,
                amount: order.totalAmount,
                status: 'PENDING',
            },
        });
        res.status(200).json({
            status: 'success',
            data: {
                razorpayOrder,
            },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Payment initiation failed' });
    }
};
exports.createPaymentOrder = createPaymentOrder;
/**
 * 2. Verify Payment Signature
 * This is called by the frontend immediately after the user finishes paying in the Razorpay UI.
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ status: 'fail', message: 'Missing payment verification details' });
            return;
        }
        // Reconstruct the expected signature
        const bodyText = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', env_1.config.payment.razorpayKeySecret)
            .update(bodyText.toString())
            .digest('hex');
        const isAuthentic = expectedSignature === razorpay_signature;
        if (!isAuthentic) {
            res.status(400).json({ status: 'fail', message: 'Payment signature verification failed' });
            return;
        }
        // Find the pending payment intent
        const payment = await prisma_1.default.payment.findUnique({
            where: { razorpayId: razorpay_order_id },
        });
        if (!payment) {
            res.status(404).json({ status: 'fail', message: 'Payment record not found' });
            return;
        }
        // Update payment record to SUCCESS
        await prisma_1.default.payment.update({
            where: { id: payment.id },
            data: {
                status: 'SUCCESS',
                paymentMethod: 'ONLINE', // Could be expanded depending on razorpay hook
            },
        });
        // Update the overarching Order status to CONFIRMED
        await prisma_1.default.order.update({
            where: { id: payment.orderId },
            data: { status: 'CONFIRMED' },
        });
        res.status(200).json({
            status: 'success',
            message: 'Payment verified successfully',
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Payment verification failed' });
    }
};
exports.verifyPayment = verifyPayment;
