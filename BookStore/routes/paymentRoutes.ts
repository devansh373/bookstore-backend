import { Order } from "../models/order";
import { Request, Response } from "express";
import express from "express";
import crypto from "crypto";
import razorpay from "../razorpayClient";
import { isAuthenticated } from "../middleware/authMiddleware";

const router = express.Router();


router.post("/order", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const user = (req as any).user;
    const receipt = `rcpt_${Date.now()}`;

    const options = {
      amount: Math.round(orderData.amount), 
      currency: orderData.currency,
      receipt,
      notes: { userId: user?.id },
    };

    const rzpOrder = await razorpay.orders.create(options);

    const orderDoc = await Order.create({
      orderId: rzpOrder.id,
      receipt,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,

      userId: user?.id,
      email: user?.email,
      mobileNumber: user?.phone,
      customerName: user?.name,
      address: orderData.address,
      bookId: orderData.bookId,
      quantity: orderData.quantity,
      price: orderData.price,
      condition: orderData.condition,
      notes: rzpOrder.notes,
      status: "created",
    });

    res.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      callback_url: `${process.env.APP_BASE_URL}/api/bookstore/payments/callback`,
      user,
    });
  } catch (e) {
    res.status(500).json({ error: "Unable to create order" });
  }
});


router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { razorpay_payment_id, razorpay_order_id: verify_order_id, razorpay_signature } =
      req.body;
    const body = `${verify_order_id}|${razorpay_payment_id}`;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not defined");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ ok: false, message: "Invalid signature" });
      return 
    }

    const order = await Order.findOneAndUpdate(
      { orderId: verify_order_id },
      {
        $set: { status: "paid" },
        $push: {
          payments: { paymentId: razorpay_payment_id, status: "captured" },
        },
      },
      { new: true }
    );

    res.json({ ok: true, order });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});


router.post(
  "/callback",
  express.urlencoded({ extended: false }),
  async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id: callback_order_id } = req.body || {};
    res.send(`<html><body><h2>Thanks! We’re processing your order.</h2>
            <p>Order: ${callback_order_id}</p>
            <p>You’ll receive a receipt shortly.</p></body></html>`);
  }
);


router.post(
  "/webhook",
  express.json({ type: "/" }),
  async (req: Request, res: Response) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
      const signature = req.headers["x-razorpay-signature"] as string;

      const shasum = crypto.createHmac("sha256", webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest !== signature) {
        res.status(400).send("Invalid signature");
        return;
      }

      const event = req.body.event;

      switch (event) {
        case "payment.captured": {
          const payment = req.body.payload.payment.entity;

          await Order.findOneAndUpdate(
            { orderId: payment.order_id },
            {
              $set: {
                status: "paid",
                paymentType: payment.method, 
              },
              $push: {
                payments: {
                  paymentId: payment.id,
                  status: payment.status,
                  method: payment.method, 
                },
              },
            },
            { new: true }
          );

          break;
        }

        case "payment.failed": {
          const payment = req.body.payload.payment.entity;


          await Order.findOneAndUpdate(
            { orderId: payment.order_id },
            {
              $set: {
                status: "failed",
                paymentType: payment.method, 
              },
              $push: {
                payments: {
                  paymentId: payment.id,
                  status: payment.status,
                  method: payment.method,
                },
              },
            },
            { new: true }
          );

          break;
        }

        default:
      }

      res.status(200).json({ status: "ok" });
    } catch (err) {
      res.status(500).send("Server error");
    }
  }
);

router.get("/order/:orderId", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) {
    res.status(404).json({ error: "Not found" });
    return 
  }
  res.json({ status: order.status, order });
});

export default router;