import { Request, Response } from 'express';
import { Order } from '../models/order';
import { BookModel } from '../models/homepage';

export const getCancelReasons = (_req: Request, res: Response) => {
  const reasons: string[] = [
    "I changed my mind",
    "I don't like the book content",
    "Found the book cheaper elsewhere",
    "The book is taking too long to arrive",
    "I ordered the wrong book",
    "I wanted a different edition or format",
    "I no longer need the book",
    "Other"
  ];
  res.status(200).json({ reasons });
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, email, mobileNumber, address, paymentType, quantity, price, status = 'Shipped', condition, bookId } = req.body;

    if (!customerName || !email || !mobileNumber || !address || !address.street || !address.city || !address.state || !address.country || !address.pinCode || !paymentType || quantity == null || price == null || !condition || !bookId) {
      res.status(400).json({ message: 'All fields are required, including bookId.' });
      return;
    }

    const book = await BookModel.findById(bookId);
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    if (condition === 'New' && book.quantityNew < quantity) {
      res.status(400).json({ message: `Insufficient new stock. Only ${book.quantityNew} available.` });
      return;
    }
    if (condition === 'Old' && book.quantityOld < quantity) {
      res.status(400).json({ message: `Insufficient old stock. Only ${book.quantityOld} available.` });
      return;
    }
    if (condition === 'New') book.quantityNew -= quantity;
    if (condition === 'Old') book.quantityOld -= quantity;
    await book.save();

    const order = await Order.create({ customerName, email, mobileNumber, address, paymentType, quantity, price, status, condition, bookId });
    res.status(201).json({
      message: 'Order added successfully',
      order: {
        _id: order._id,
        customerName: order.customerName,
        email: order.email,
        mobileNumber: order.mobileNumber,
        address: order.address,
        paymentType: order.paymentType,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        condition: order.condition,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        date: order.date,
        bookId: order.bookId,
        title: book.title,
        imageUrl: book.imageUrl,
        cancelReason: order.cancelReason || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('bookId', 'title imageUrl');
    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders: orders.map(order => ({
        _id: order._id,
        customerName: order.customerName,
        email: order.email,
        mobileNumber: order.mobileNumber,
        address: order.address,
        paymentType: order.paymentType,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        condition: order.condition,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        date: order.date,
        bookId: order.bookId,
        title: order.bookId ? (order.bookId as any).title : 'Unknown Book',
        imageUrl: order.bookId ? (order.bookId as any).imageUrl : null,
        cancelReason: order.cancelReason || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('bookId', 'title imageUrl');
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json({
      message: 'Order retrieved successfully',
      order: {
        _id: order._id,
        customerName: order.customerName,
        email: order.email,
        mobileNumber: order.mobileNumber,
        address: order.address,
        paymentType: order.paymentType,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        condition: order.condition,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        date: order.date,
        bookId: order.bookId,
        title: order.bookId ? (order.bookId as any).title : 'Unknown Book',
        imageUrl: order.bookId ? (order.bookId as any).imageUrl : null,
        cancelReason: order.cancelReason || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).populate('bookId', 'title imageUrl');
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        customerName: order.customerName,
        email: order.email,
        mobileNumber: order.mobileNumber,
        address: order.address,
        paymentType: order.paymentType,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        condition: order.condition,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        date: order.date,
        bookId: order.bookId,
        title: order.bookId ? (order.bookId as any).title : 'Unknown Book',
        imageUrl: order.bookId ? (order.bookId as any).imageUrl : null,
        cancelReason: order.cancelReason || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    // Optionally, restore book stock
    const book = await BookModel.findById(order.bookId);
    if (book) {
      if (order.condition === 'New') book.quantityNew += order.quantity;
      if (order.condition === 'Old') book.quantityOld += order.quantity;
      await book.save();
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ message: 'Cancellation reason is required' });
      return;
    }

    const order = await Order.findById(id).populate('bookId', 'title imageUrl');
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status === 'Cancelled') {
      res.status(400).json({ message: 'Order is already cancelled' });
      return;
    }

    if (order.status === 'Delivered') {
      res.status(400).json({ message: 'Cannot cancel a delivered order' });
      return;
    }

    order.status = 'Cancelled';
    order.cancelReason = reason;
    await order.save();

    // Optionally, restore book stock
    const book = await BookModel.findById(order.bookId);
    if (book) {
      if (order.condition === 'New') book.quantityNew += order.quantity;
      if (order.condition === 'Old') book.quantityOld += order.quantity;
      await book.save();
    }

    res.status(200).json({
      message: `Order ${id} has been cancelled successfully.`,
      order: {
        _id: order._id,
        customerName: order.customerName,
        email: order.email,
        mobileNumber: order.mobileNumber,
        address: order.address,
        paymentType: order.paymentType,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        condition: order.condition,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        date: order.date,
        bookId: order.bookId,
        title: order.bookId ? (order.bookId as any).title : 'Unknown Book',
        imageUrl: order.bookId ? (order.bookId as any).imageUrl : null,
        cancelReason: order.cancelReason,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const refundOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    // Implement refund logic here (e.g., integrate with payment gateway)
    res.status(200).json({ message: 'Refund processed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req as any).user?.email;

    if (!userEmail) {
      res.status(401).json({ message: "Unauthorized. Please login first." });
      return;
    }

    const orders = await Order.find({ email: userEmail }).populate("bookId", "title imageUrl");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        _id: order._id,
        customerName: order.customerName,
        email: order.email,
        mobileNumber: order.mobileNumber,
        address: order.address,
        paymentType: order.paymentType,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        condition: order.condition,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        date: order.date,
        bookId: order.bookId,
        title: order.bookId ? (order.bookId as any).title : "Unknown Book",
        imageUrl: order.bookId ? (order.bookId as any).imageUrl : null,
        cancelReason: order.cancelReason || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err instanceof Error ? err.message : "Unknown error" });
  }
};

