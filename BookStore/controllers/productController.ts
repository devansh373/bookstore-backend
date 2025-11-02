import { Request, Response } from 'express';
import { Product } from '../models/product';
import { BookModel } from '../models/homepage';


export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, price, inventory, description } = req.body;

    if (!productName || price == null || inventory == null) {
      res.status(400).json({ message: 'Product name, price, and inventory are required.' });
      return;
    }

    const product = await Product.create({ productName, price, inventory, description });

    res.status(201).json({
      message: 'Product added successfully',
      productId: product._id,
      product,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};


export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productName, price, inventory, description } = req.body;

    const updated = await Product.findByIdAndUpdate(
      id,
      { productName, price, inventory, description },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};


export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};


export const bulkCreateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      res
        .status(400)
        .json({ message: "Products array is required and cannot be empty." });
      return;
    }
    // const validProducts = products.map(
    //   (p: any) =>
    //     ({
    //       title: p.title,
    //       tags: p.tags,
    //       seoTitle: p.seoTitle,
    //       seoDescription: p.seoDescription,
    //       price: p.price,
    //       description: p.description,
    //       estimatedDelivery: p.estimatedDelivery,
    //       condition: p.condition,
    //       author: p.author,
    //       publisher: p.publisher,
    //       imageUrl: p.imageUrl,
    //       quantityNew: p.quantityNew,
    //       quantityOld: p.quantityOld,
    //       discountNew: p.discountNew,
    //       discountOld: p.discountOld,
    //     } = req.body)

    // );


    if (products.length === 0) {
      res.status(400).json({ message: "No valid products provided." });
      return;
    }

    const savedProducts = await BookModel.insertMany(products);
    // const savedProducts = await Product.insertMany(products);

    res.status(201).json({
      success: true,
      message: "Products added successfully",
      products: savedProducts,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};