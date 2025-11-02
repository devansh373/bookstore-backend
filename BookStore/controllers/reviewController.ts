import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BookstoreReviewModel } from '../models/review';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await BookstoreReviewModel.find().populate({
      path: 'bookId',
      select: 'title price imageUrl subCategory',
      match: { _id: { $exists: true } },
    }).lean();
    res.status(200).json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected error occurred while fetching reviews', details: err.message });
  }
};

export const getApprovedReviewsByBookId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ error: 'Invalid bookId format' });
      return;
    }
    const reviews = await BookstoreReviewModel.find({
      bookId: new mongoose.Types.ObjectId(bookId),
      status: 'approved',
    }).populate({
      path: 'bookId',
      select: 'title price imageUrl subCategory',
      match: { _id: { $exists: true } },
    }).lean();
    res.status(200).json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected error occurred while fetching approved reviews', details: err.message });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, name, email, rating, comment, categoryName } = req.body;

    
    if (!bookId || !name || !rating || !comment || !categoryName) {
      res.status(400).json({ error: 'Missing required fields: bookId, name, rating, comment, or categoryName' });
      return;
    }

   
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ error: 'Invalid bookId format' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const review = new BookstoreReviewModel({
      bookId,
      name,
      email,
      rating,
      comment,
      categoryName,
      status: 'pending',
    });

    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected error occurred while creating the review', details: err.message });
  }
};

export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid review ID format' });
      return;
    }
    const review = await BookstoreReviewModel.findById(id).populate({
      path: 'bookId',
      select: 'title price imageUrl subCategory',
    });
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.status(200).json(review);
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected error occurred while fetching the review', details: err.message });
  }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid review ID format' });
      return;
    }

    const updateFields: any = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }
      updateFields.rating = rating;
    }
    if (comment !== undefined) updateFields.comment = comment;
    if (status !== undefined) {
      if (!['pending', 'approved', 'disapproved'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
      }
      updateFields.status = status;
    }

    const review = await BookstoreReviewModel.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.status(200).json(review);
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected error occurred while updating the review', details: err.message });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid review ID format' });
      return;
    }
    const review = await BookstoreReviewModel.findByIdAndDelete(id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'An unexpected error occurred while deleting the review', details: err.message });
  }
};