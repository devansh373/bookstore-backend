require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";

export const app = express();
app.use(express.json({ limit: "50mb" }));
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error";

import { rateLimit } from 'express-rate-limit'
// import AWS from 'aws-sdk'
// import crypto from 'crypto'
// import Razorpay from 'razorpay'
// import mongoose from 'mongoose'
// import messageRoutes from './Message/routes/messageRoutes';
// import teamRoutes from './Team/routes/teamRoutes';
// import authUserRoutes from './Minimalistic-Technology/Auth/routes/authUserRoutes';
// import templateRoutes from './Minimalistic-Technology/Template/routes/templateRoutes';
// import testimonialRoutes from './Minimalistic-Technology/Testimonial/routes/testimonialRoutes';
// import authRoutes from './Minimalistic-Learning/Auth/routes/authRoutes';
// import blogRoutes from './Minimalistic-Learning/Blog/routes/blogRoutes';
// import quoteBlogRoutes from './Minimalistic-Learning/Blog/routes/quoteBlogRoutes';
// import profileRoutes from './Minimalistic-Learning/Profile/routes/profileRoutes';
// import otpRoutes from './Minimalistic-Learning/OTP/routes/otpRoutes';
import authAccessRoutes from './BookStore/routes/authAccessRoutes';
import bookstoreAuthRoutes from './BookStore/routes/bookstoreAuthRoutes';
import bookOrderRoutes from './BookStore/routes/bookOrderRoutes';
import bulkuserRoutes from './BookStore/routes/bulkuserRoutes';
import BookStorecategoryRoutes from './BookStore/routes/BookStorecategoryRoutes';
import homepageRoutes from './BookStore/routes/homepageRoutes';
import newsubRoutes from './BookStore/routes/newsubRoutes';
import productRoutes from './BookStore/routes/productRoutes';
import siteSettingsRoutes from './BookStore/routes/siteSettingsRoutes';
import subscriberRoutes from './BookStore/routes/subscriberRoutes';
import paymentRoutes from './BookStore/routes/paymentRoutes';
import otpAuthRoutes from './BookStore/routes/otpAuthRoutes';
import cartRoutes from './BookStore/routes/cartRoutes';
// import propertyRoutes from './Siddhi-E-State/Property/routes/propertyRoutes';
// import redevelopmentRoutes from "./Siddhi-E-State/Property/routes/redevelopmentRoutes";
// import commercialRoutes from "./Siddhi-E-State/Property/routes/commercialRoutes";
// import brokerRoutes from "./Siddhi-E-State/Property/routes/brokerRoutes";
// import propertyMessageRoutes from "./Siddhi-E-State/Property/routes/propertyMessageRoutes";
// import propertyRequirementRoutes from "./Siddhi-E-State/Property/routes/propertyRequirementRoutes";
// import EmailRoutes from './E-mail/routes/EmailRoutes';


require('dotenv').config();
// const apiLogger = require('./controllers/apiLogger');
// cors => cross origin resource sharing
app.use(
  cors({
    // make sure you don't have / in last
    // Do "http://localhost:3000"
    // Don't "http://localhost:3000/"
    origin: ["https://minimalistictechnology.com", "https://www.minimalistictechnology.com","http://minimalistictechnology.com","http://www.minimalistictechnology.com",
"https://minimalisticlearning.com","http://minimalisticlearning.com","https://www.minimalisticlearning.com","http://www.minimalisticlearning.com", 
            "https://books-store-inky-one.vercel.app", "https://siddhi-e-state.vercel.app","http://localhost:3000","https://bookstore-sg0v.onrender.com"],
    credentials: true,
  })
);

app.use(cookieParser());

// app.use(
//   "/api/ml",
//   otpRoutes
// );

// app.use('/api', messageRoutes);
// app.use('/api/team', teamRoutes);

// app.use
// (
//   "/api/ml/auth",
//   authRoutes
// );

// app.use(
//   "/api/ml/blog",
//   blogRoutes
// );

// app.use(
//   "/api/ml/quote",
//   quoteBlogRoutes
// );

// app.use(
//   "/api/ml/profile",
//   profileRoutes
// );

// app.use(
//   "/api/mt/auth",
//   authUserRoutes
// );


// app.use(
//   "/api/mt/testimonials",
//   testimonialRoutes
// );

// app.use(
//   "/api/mt/templates",
//   templateRoutes
// );

app.use('/api/bookstore', authAccessRoutes);
app.use('/api/bookstore', bookstoreAuthRoutes);
app.use('/api/bookstore', bookOrderRoutes);
app.use('/api/bookstore', BookStorecategoryRoutes);
app.use('/api/bookstore', bulkuserRoutes);
app.use('/api/bookstore', homepageRoutes);
app.use('/api/bookstore', newsubRoutes);
app.use('/api/bookstore', productRoutes);
app.use('/api/bookstore', siteSettingsRoutes);
app.use('/api/bookstore', subscriberRoutes);
app.use('/api/bookstore', paymentRoutes);
app.use('/api/bookstore', otpAuthRoutes);
app.use('/api/bookstore', cartRoutes);


// app.use('/api/property', propertyRoutes);
// app.use('/api/property', redevelopmentRoutes);
// app.use('/api/property', commercialRoutes);
// app.use('/api/property', brokerRoutes);
// app.use('/api/property', propertyRequirementRoutes);
// app.use('/api/property', propertyMessageRoutes);

// app.use('/api/email', EmailRoutes);


// api requests limit
// const limiter = rateLimit({
//   windowMs: 5 * 60 * 1000,
// 	max: 100,
// 	standardHeaders: 'draft-7',
// 	legacyHeaders: false,
// })

const limiter = rateLimit({
  windowMs: 60000, // 1 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, 
  legacyHeaders: false,
  handler: function (req, res, next) {
      setTimeout(() => {
        next();
      }, 5000); 
  }
})

// middleware calls
app.use(limiter);
// app.use(apiLogger)
// routes



// testing api
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "GET API is working fine by Parth Doshi",
  });
});


// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});


app.use(errorMiddleware);

export default app;
