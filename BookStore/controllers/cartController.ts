import { Request, Response } from "express";
import Cart from "../models/cart";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ userId: (req as any).user.id }).populate({
      path: "items.bookId",
      select: "-__v",
    });

    res.json(cart || { userId: (req as any).user.id, items: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, quantity, stock, condition } = req.body;
    let cart = await Cart.findOne({ userId: (req as any).user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: (req as any).user.id,
        items: [{ bookId, quantity: quantity || 1, stock, condition: condition || "New" }],
      });
    } else {
      // match both bookId and condition so Old/New can coexist
      const existingItem = cart.items.find(
        item => item.bookId.toString() === bookId && item.condition === (condition || "New")
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({
          bookId,
          quantity: quantity || 1,
          stock,
          condition: condition || "New"
        });
      }

      await cart.save();
    }

    await cart.populate({ path: "items.bookId", select: "-__v" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};


export const updateQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, quantity, condition } = req.body;
    const cart = await Cart.findOne({ userId: (req as any).user.id });
    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    const item = cart.items.find(
      item => item.bookId.toString() === bookId && item.condition === (condition || "New")
    );
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate({ path: "items.bookId", select: "-__v" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to update quantity" });
  }
};

export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;
    const { condition } = req.query;

    const cart = await Cart.findOne({ userId: (req as any).user.id });
    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    cart.items = cart.items.filter(
      item => !(item.bookId.toString() === bookId && item.condition === (condition as string || "New"))
    );

    await cart.save();
    await cart.populate({ path: "items.bookId", select: "-__v" });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};


export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: (req as any).user.id },
      { $set: { items: [] } },
      { new: true }
    );

    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};