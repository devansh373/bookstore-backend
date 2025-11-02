import mongoose, { Schema, Model } from 'mongoose';

interface IBookstoreReview {
  bookId: mongoose.Types.ObjectId;
  categoryName: string;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'disapproved';
  createdAt?: Date;
  updatedAt?: Date;
}

const bookstoreReviewSchema = new Schema<IBookstoreReview>(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'disapproved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);


const BookstoreReviewModel: Model<IBookstoreReview> = mongoose.models.BookstoreReview || mongoose.model<IBookstoreReview>('BookstoreReview', bookstoreReviewSchema);

export { BookstoreReviewModel };