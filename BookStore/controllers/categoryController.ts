import { Request, Response } from 'express';
import { Category } from '../models/category';

export class CategoryController {
 
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories', error });
    }
  }

 
  static async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

 
  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData = {
        name: req.body.name,
        seoTitle: req.body.seoTitle,
        seoDescription: req.body.seoDescription,
      };

      const category = new Category(categoryData);
      const newCategory = await category.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

 
  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }

      category.name = req.body.name || category.name;
      category.seoTitle = req.body.seoTitle || category.seoTitle;
      category.seoDescription = req.body.seoDescription || category.seoDescription;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  
  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      await category.deleteOne();
      res.json({ message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
