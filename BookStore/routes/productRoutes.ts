import express from 'express';
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  bulkCreateProduct,
} from '../controllers/productController';

const router = express.Router();

router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/bulk', bulkCreateProduct); 

export default router;
