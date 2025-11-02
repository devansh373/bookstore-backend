import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  bookId: mongoose.Types.ObjectId;
  quantity: number;
  stock: number;
  condition: "New" | "Old";
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  quantity: { type: Number, default: 1 },
  stock: { type: Number },
  condition: { type: String, enum: ["New", "Old"], default: "New" },
});

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);