import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        name: process.env.DB_NAME || 'kirana_db',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_super_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    payment: {
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
        razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    },
    firebase: {
        serverKey: process.env.FIREBASE_SERVER_KEY || '',
    }
};
