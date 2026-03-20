import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
            },
        });

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products,
            },
        });
    } catch (error: any) {
        console.error('Error fetching products:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch products' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: id as string },
        });

        if (!product) {
            res.status(404).json({ status: 'fail', message: 'Product not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                product,
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch product' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, stock, imageUrl, category } = req.body;

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                imageUrl,
                category,
            },
        });

        res.status(201).json({
            status: 'success',
            data: {
                product: newProduct,
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to create product' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, imageUrl, category, isActive } = req.body;

        // Check if the product exists first
        const existingProduct = await prisma.product.findUnique({
            where: { id: id as string },
        });

        if (!existingProduct) {
            res.status(404).json({ status: 'fail', message: 'Product not found' });
            return;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: id as string },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock, 10) : undefined,
                imageUrl,
                category,
                isActive: isActive !== undefined ? isActive : undefined,
            },
        });

        res.status(200).json({
            status: 'success',
            data: {
                product: updatedProduct,
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        // Check if the product exists first
        const existingProduct = await prisma.product.findUnique({
            where: { id: id as string },
        });

        if (!existingProduct) {
            res.status(404).json({ status: 'fail', message: 'Product not found' });
            return;
        }

        // Usually, in a production e-commerce system, we "soft delete" the product 
        // by marking isActive as false, rather than true deletion from the database.
        // That ensures order histories do not break due to missing products.

        await prisma.product.update({
            where: { id: id as string },
            data: { isActive: false },
        });

        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete product' });
    }
};
