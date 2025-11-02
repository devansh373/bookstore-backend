import mongoose, { Document, Model } from "mongoose";

export interface SubscriberDocument extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

const subscriberSchema = new mongoose.Schema<SubscriberDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Subscriber: Model<SubscriberDocument> = mongoose.model<SubscriberDocument>(
  "Subscriber",
  subscriberSchema
);

export type SubscriberType = InstanceType<typeof Subscriber>;