import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive'
  },
  notifications: {
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);