import Razorpay from 'razorpay';
import { config } from './env';

export const razorpay = new Razorpay({
    key_id: config.payment.razorpayKeyId,
    key_secret: config.payment.razorpayKeySecret,
});
