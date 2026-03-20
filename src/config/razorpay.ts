import Razorpay from 'razorpay';
import { config } from './env';

export const razorpay = new Razorpay({
    key_id: config.payment.razorpayKeyId || 'rzp_test_dummy_key',
    key_secret: config.payment.razorpayKeySecret || 'dummy_secret',
});
