import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  bookName: string;
  categoryPath: string; 
  title: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  price?: number;
  description?: string;
  estimatedDelivery?: string;
  condition?: string;
  author?: string;
  publisher?: string;
  imageUrl?: string;
  quantityNew?: number;
  quantityOld?: number;
  discountNew?: number;
  discountOld?: number;
  effectiveDiscount?: number;
  discountedPrice?: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export interface IBookCategory extends Document {
  name: string;
  path: string;
  children: mongoose.Types.ObjectId[];
  books: mongoose.Types.ObjectId[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  discount?: number; 
}

export interface IClothingCategory extends Document {
  name: string;
  gender: string;
  dresses: mongoose.Types.ObjectId[];
}

const BookCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, index: true },
    path: { type: String, required: true, unique: true, index: true },
    children: [{ type: Schema.Types.ObjectId, ref: 'BookCategory' }],
    books: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    tags: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    discount: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

const BookSchema: Schema = new Schema(
  {
    bookName: { type: String, required: true },
    categoryPath: { type: String, required: true, index: true },
    title: { type: String, required: true },
    tags: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    price: { type: Number },
    description: { type: String },
    estimatedDelivery: { type: String },
    condition: { type: String },
    author: { type: String },
    publisher: { type: String },
    imageUrl: { type: String },
    quantityNew: { type: Number, default: 0 },
    quantityOld: { type: Number, default: 0 },
    discountNew: { type: Number, default: 0 }, 
    discountOld: { type: Number, default: 0 },
    effectiveDiscount: { type: Number, default: 0 },
    discountedPrice: { type: Number },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ClothingCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, required: true, enum: ['men', 'women'] },
    dresses: [{ type: Schema.Types.ObjectId, ref: 'Dress' }],
  },
  { timestamps: true, collection: 'Category' }
);

export const BookModel = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);
export const BookCategoryModel = mongoose.models.BookCategory || mongoose.model<IBookCategory>('BookCategory', BookCategorySchema);
export const ClothingCategoryModel = mongoose.models.Category || mongoose.model<IClothingCategory>('Category', ClothingCategorySchema);