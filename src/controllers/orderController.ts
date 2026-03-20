import { Request, Response } from 'express';

import prisma from '../config/prisma';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
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
        const order = await prisma.$transaction(async (tx: any) => {
            let totalAmount = 0;
            const orderItemsData: any[] = [];

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

            // Apply standard ₹50 delivery fee if subtotal is under ₹500
            let finalTotalAmount = totalAmount;
            if (totalAmount > 0 && totalAmount < 500) {
                finalTotalAmount += 50; 
            }

            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount: finalTotalAmount,
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
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Failed to create order' });
    }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ status: 'fail', message: 'User not authenticated' });
            return;
        }

        const orders = await prisma.order.findMany({
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
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch your orders' });
    }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await prisma.order.findMany({
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
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch all orders' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const existingOrder = await prisma.order.findUnique({
            where: { id: id as string },
        });

        if (!existingOrder) {
            res.status(404).json({ status: 'fail', message: 'Order not found' });
            return;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: id as string },
            data: { status },
        });

        res.status(200).json({
            status: 'success',
            data: {
                order: updatedOrder,
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update order status' });
    }
};
