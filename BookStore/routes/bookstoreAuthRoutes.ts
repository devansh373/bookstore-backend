import express from "express";
import { bookstoreLogin } from "../controllers/bookstoreAuthController";

const router = express.Router();

// Bookstore login route
router.post("/login", bookstoreLogin);

export default router;
