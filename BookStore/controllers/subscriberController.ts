import { Request, Response } from 'express';
import Subscriber from '../models/subscriber';

export const getSubscribers = async (_req: Request, res: Response) => {
  const subscribers = await Subscriber.find();
  res.json(subscribers);
};

export const addSubscriber = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const newSubscriber = new Subscriber({ name, email });
  await newSubscriber.save();
  res.status(201).json(newSubscriber);
};

export const updateSubscriberStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const subscriber = await Subscriber.findByIdAndUpdate(id, { status }, { new: true });
  res.json(subscriber);
};

export const updateNotificationSettings = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { push, email } = req.body;
  const updated = await Subscriber.findByIdAndUpdate(
    id,
    { notifications: { push, email } },
    { new: true }
  );
  res.json(updated);
};

export const deleteSubscriber = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Subscriber.findByIdAndDelete(id);
  res.json({ message: 'Subscriber deleted' });
};
