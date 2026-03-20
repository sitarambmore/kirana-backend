"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getProducts = async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
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
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch products' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.default.product.findUnique({
            where: { id: id },
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
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch product' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl, category } = req.body;
        const newProduct = await prisma_1.default.product.create({
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
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, imageUrl, category, isActive } = req.body;
        // Check if the product exists first
        const existingProduct = await prisma_1.default.product.findUnique({
            where: { id: id },
        });
        if (!existingProduct) {
            res.status(404).json({ status: 'fail', message: 'Product not found' });
            return;
        }
        const updatedProduct = await prisma_1.default.product.update({
            where: { id: id },
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
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if the product exists first
        const existingProduct = await prisma_1.default.product.findUnique({
            where: { id: id },
        });
        if (!existingProduct) {
            res.status(404).json({ status: 'fail', message: 'Product not found' });
            return;
        }
        // Usually, in a production e-commerce system, we "soft delete" the product 
        // by marking isActive as false, rather than true deletion from the database.
        // That ensures order histories do not break due to missing products.
        await prisma_1.default.product.update({
            where: { id: id },
            data: { isActive: false },
        });
        res.status(204).send(); // 204 No Content
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
