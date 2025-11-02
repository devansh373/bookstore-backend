import mongoose, { Schema, Document, Types } from "mongoose";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "created"   
  | "paid"      
  | "failed"
  | "refunded";

export type PaymentType =
  | "Credit Card"
  | "Debit Card"
  | "UPI"
  | "Cash on Delivery";

export type Condition = "New" | "Old";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface IPayment {
  paymentId: string;
  status: string;
  method?: string;
  captured?: boolean;
  email?: string;
  contact?: string;
  raw?: any;
}

export interface IOrder extends Document {

  customerName: string;
  email: string;
  mobileNumber: string;
  address: IAddress;

 
  bookId: Types.ObjectId;
  quantity: number;
  price: number;
  condition: Condition;

  
  paymentType: PaymentType;
  status: OrderStatus;
  cancelReason?: string;


  orderId?: string; // Razorpay orderId
  receipt?: string;
  currency: string;
  notes?: Record<string, any>;
  payments: IPayment[];

  
  date?: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const OrderSchema: Schema = new Schema<IOrder>(
  {
    
    customerName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      pinCode: { type: String, required: true, trim: true },
    },

    
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    condition: { type: String, enum: ["New", "Old"], required: true },

    
    paymentType: {
      type: String,
      enum: ["Credit Card", "Debit Card", "UPI", "Cash on Delivery"],
      
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "created",
        "paid",
        "failed",
        "refunded",
      ],
      default: "Pending",
    },
    cancelReason: { type: String },

    
    orderId: { type: String, index: true, unique: true, sparse: true },
    receipt: { type: String, index: true },
    currency: { type: String, default: "INR" },
    notes: { type: Object },
    payments: [
      {
        paymentId: String,
        status: String,
        method: String,
        captured: Boolean,
        email: String,
        contact: String,
        raw: Object,
      },
    ],

    
    date: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true }, versionKey: "__v" }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);