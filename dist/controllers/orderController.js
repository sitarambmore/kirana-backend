"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getMyOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        // Expecting cartItems to be an array of { productId, quantity }
        const { cartItems } = req.body;
        if (!userId) {
            res.status(401).json({ status: 'fail', message: 'User not authenticated' });
            return;
        }
        if (!cartItems || cartItems.length === 0) {
            res.status(400).json({ status: 'fail', message: 'No order items' });
            return;
        }
        // Use a Prisma transaction to ensure stock is decreased and order is created atomically
        const order = await prisma_1.default.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData = [];
            for (const item of cartItems) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product || !product.isActive) {
                    throw new Error(`Product not found or inactive: ${item.productId}`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                // Calculate amount
                totalAmount += product.price * item.quantity;
                // Decrease stock
                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: product.stock - item.quantity },
                });
                orderItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price, // Save the price at the time of purchase
                });
            }
            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    orderItems: {
                        create: orderItemsData,
                    },
                },
                include: {
                    orderItems: true,
                },
            });
            return newOrder;
        });
        res.status(201).json({
            status: 'success',
            data: {
                order,
            },
        });
    }
    catch (error) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ status: 'fail', message: 'User not authenticated' });
            return;
        }
        const orders = await prisma_1.default.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: { name: true, imageUrl: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch your orders' });
    }
};
exports.getMyOrders = getMyOrders;
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                },
                orderItems: {
                    include: {
                        product: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch all orders' });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const existingOrder = await prisma_1.default.order.findUnique({
            where: { id: id },
        });
        if (!existingOrder) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }
        const updatedOrder = await prisma_1.default.order.update({
            where: { id: id },
            data: { status },
        });
        res.status(200).json({
            status: 'success',
            data: {
                order: updatedOrder,
            },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
