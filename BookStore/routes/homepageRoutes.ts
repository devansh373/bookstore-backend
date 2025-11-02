import express from 'express';
import BookController from '../controllers/homepageController';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getApprovedReviewsByBookId,
} from '../controllers/reviewController';
import BookRequestController from '../controllers/addbookController';
import { isAuthenticated, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.get('/book-categories', BookController.getAllCategories);
router.post('/book-categories', isAuthenticated, adminOnly, BookController.createCategory);
router.get('/book-categories/:path*', BookController.getCategoryByPath);
router.put('/book-categories/:path*', isAuthenticated, adminOnly, BookController.updateCategory);
router.delete('/book-categories/:path*', isAuthenticated, adminOnly, BookController.deleteCategory);
router.post('/book-categories/:path*/tags', isAuthenticated, adminOnly, BookController.createTag);
router.delete('/book-categories/:path*/tags/:tagName', isAuthenticated, adminOnly, BookController.deleteTag);

router.get('/books/search', BookController.searchBooks);

router.get('/books/:bookId([0-9a-fA-F]{24})', BookController.getBookById);
router.delete('/books/:bookId([0-9a-fA-F]{24})', isAuthenticated, adminOnly, BookController.deleteBook);
router.put('/books/:path*/:bookId([0-9a-fA-F]{24})', isAuthenticated, adminOnly, BookController.updateBook);

router.post('/books/:path*', isAuthenticated, adminOnly, BookController.createBook);
router.get('/books/:path*', BookController.getBooksByCategoryPath);
router.get('/books', isAuthenticated, adminOnly, BookController.getAllBooks);

router.get('/bestsellers', BookController.getBestSellers);
router.get('/newarrivals', BookController.getNewArrivals); 

router.delete('/book-categories', isAuthenticated, adminOnly, BookController.deleteAllCategories);
router.delete('/books', isAuthenticated, adminOnly, BookController.deleteAllBooks);

router.get('/reviews', isAuthenticated, adminOnly, getReviews);
router.get('/reviews/book/:bookId', getApprovedReviewsByBookId);
router.post('/reviews', isAuthenticated, createReview);
router.get('/reviews/:id', isAuthenticated, adminOnly, getReviewById);
router.put('/reviews/:id', isAuthenticated, adminOnly, updateReview);
router.delete('/reviews/:id', isAuthenticated, adminOnly, deleteReview);

router.post('/book-requests', isAuthenticated, BookRequestController.createBookRequest);
router.get("/my-book-requests", isAuthenticated, BookRequestController.getMyBookRequests);
router.get('/book-requests', BookRequestController.getBookRequests);

export default router;