import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, unitPrice: Number, quantity: Number }],
  shippingAddress: { name: String, phone: String, line1: String, city: String, state: String, postalCode: String, country: { type: String, default: 'India' } },
  subtotal: Number, shipping: { type: Number, default: 0 }, total: Number,
  paymentMethod: { type: String, enum: ['COD', 'RAZORPAY'], required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['Pending','Confirmed','Processing','Shipped','Out for Delivery','Delivered','Cancelled','Returned','Refunded'], default: 'Pending' },
  razorpayOrderId: String, razorpayPaymentId: String
}, { timestamps: true });
export default mongoose.model('Order', schema);
