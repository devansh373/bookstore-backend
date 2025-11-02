import { Schema, model, Document } from 'mongoose';

  interface ICategory extends Document {
    name: string;
  type?: string;
  seoTitle?: string;
  seoDescription?: string;
  }

  const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    seoTitle: { type: String, required: true },
    seoDescription: { type: String, required: true }
  });

  export const Category = model<ICategory>('BookssCategory', categorySchema);