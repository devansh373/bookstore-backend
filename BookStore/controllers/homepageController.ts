import { Request, Response } from "express";
import {
  BookModel,
  BookCategoryModel,
  IBook,
  IBookCategory,
} from "../models/homepage";
import { Types } from "mongoose";


interface IPopulatedBook extends Omit<IBook, "_id"> {
  _id: Types.ObjectId;
  discountNew: number;
  discountOld: number;
  price: number;
  condition: "new" | "used";
  categoryPath: string;
}

interface IPopulatedCategory
  extends Omit<IBookCategory, "_id" | "books" | "children"> {
  _id: Types.ObjectId;
  books: IPopulatedBook[];
  children: IPopulatedCategory[];
  discount: number;
  path: string;
}

class BookController {

  private static async getCategoryDiscount(book: IPopulatedBook): Promise<number> {
    const pathParts = book.categoryPath.split('/');
    const level = pathParts.length - 1;

  
    if (level >= 2) {
      const subCategoryPath = pathParts.slice(0, 2).join('/');
      const subCategory = await BookCategoryModel.findOne({ path: subCategoryPath });
      if (subCategory && subCategory.discount > 0) {
        return subCategory.discount;
      }
    }

  
    if (level >= 1) {
      const categoryPath = pathParts[0];
      const category = await BookCategoryModel.findOne({ path: categoryPath }).exec();
      if (category && category.discount > 0) {
        return category.discount;
      }
    }


    const bookDiscount = book.condition === "new" ? book.discountNew : book.discountOld;
    return bookDiscount;
  }

  static async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await BookCategoryModel.find({
        path: { $regex: "^[^/]+$" },
      })
        .populate({
          path: "books",
          model: "Book",
        })
        .populate({
          path: "children",
          model: "BookCategory",
          populate: [
            { path: "books", model: "Book" },
            {
              path: "children",
              model: "BookCategory",
              populate: [
                { path: "books", model: "Book" },
                {
                  path: "children",
                  model: "BookCategory",
                  populate: [
                    { path: "books", model: "Book" },
                    {
                      path: "children",
                      model: "BookCategory",
                      populate: [
                        { path: "books", model: "Book" },
                        {
                          path: "children",
                          model: "BookCategory",
                          populate: [
                            { path: "books", model: "Book" },
                            {
                              path: "children",
                              model: "BookCategory",
                              populate: { path: "books", model: "Book" },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        })
        .lean();
      res.status(200).json(categories);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to fetch categories", details: err.message });
    }
  }

  static async getCategoryByPath(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.params;
      const normalizedPath = decodeURIComponent(path || "")
        .replace(/^\/+|\/+$/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const category = (await BookCategoryModel.findOne({
        path: normalizedPath,
      })
        .populate({
          path: "books",
          model: "Book",
        })
        .populate({
          path: "children",
          model: "BookCategory",
          populate: [
            { path: "books", model: "Book" },
            {
              path: "children",
              model: "BookCategory",
              populate: [
                { path: "books", model: "Book" },
                {
                  path: "children",
                  model: "BookCategory",
                  populate: [
                    { path: "books", model: "Book" },
                    {
                      path: "children",
                      model: "BookCategory",
                      populate: [
                        { path: "books", model: "Book" },
                        {
                          path: "children",
                          model: "BookCategory",
                          populate: [
                            { path: "books", model: "Book" },
                            {
                              path: "children",
                              model: "BookCategory",
                              populate: { path: "books", model: "Book" },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        })
        .lean()) as IPopulatedCategory | null;

      if (!category) {
        res
          .status(404)
          .json({ error: `Category '${normalizedPath}' not found` });
        return;
      }

      const booksWithDiscount = await Promise.all(
        category.books.map(async (book: IPopulatedBook) => {
          const effectiveDiscount = await BookController.getCategoryDiscount(book);
          const discountedPrice = book.price
            ? book.price * (1 - effectiveDiscount / 100)
            : book.price;
          return { ...book, effectiveDiscount, discountedPrice };
        })
      );

      res.status(200).json({ ...category, books: booksWithDiscount });
    } catch (err: any) {
      const path = req.params.path;
      res
        .status(500)
        .json({ error: "Failed to fetch category", details: err.message });
    }
  }

  static async getBooksByCategoryPath(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.params;
      const normalizedPath = decodeURIComponent(path || "")
        .replace(/^\/+|\/+$/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();


    
      const books = await BookModel.find({
        categoryPath: { $regex: `^${normalizedPath}(/|$)` }
      }).lean() as IPopulatedBook[];

      if (!books || books.length === 0) {
        res
          .status(404)
          .json({ error: `No books found for category path '${normalizedPath}'` });
        return;
      }

      const booksWithDiscount = await Promise.all(
        books.map(async (book: IPopulatedBook) => {
          const effectiveDiscount = await BookController.getCategoryDiscount(book);
          const discountedPrice = book.price
            ? book.price * (1 - effectiveDiscount / 100)
            : book.price;
          return { ...book, effectiveDiscount, discountedPrice };
        })
      );

      res.status(200).json(booksWithDiscount);
    } catch (err: any) {
      
      res
        .status(500)
        .json({ error: "Failed to fetch books", details: err.message });
    }
  }

  static async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookModel.find({}).lean() as IPopulatedBook[];

      if (!books || books.length === 0) {
        res
          .status(404)
          .json({ error: "No books found" });
        return;
      }

      const booksWithDiscount = await Promise.all(
        books.map(async (book: IPopulatedBook) => {
          const effectiveDiscount = await BookController.getCategoryDiscount(book);
          const discountedPrice = book.price
            ? book.price * (1 - effectiveDiscount / 100)
            : book.price;
          return { ...book, effectiveDiscount, discountedPrice };
        })
      );

      res.status(200).json(booksWithDiscount);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to fetch all books", details: err.message });
    }
  }

  static async searchBooks(req: Request, res: Response): Promise<void> {
  try {
    const { bookName } = req.query;

    if (!bookName || typeof bookName !== "string") {
      res.status(400).json({ error: "bookName query parameter is required" });
      return;
    }

    const books = await BookModel.find({
      bookName: { $regex: bookName, $options: "i" } // case-insensitive
    })
      .limit(11)
      .lean();

    if (!books || books.length === 0) {
      res.status(404).json({ error: "No books found" });
      return;
    }

    res.status(200).json({ success: true, count: books.length, books });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to search books", details: err.message });
  }
}

  static async getBestSellers(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookModel.find({ isBestSeller: true }).lean() as IPopulatedBook[];

      if (!books || books.length === 0) {
        res
          .status(404)
          .json({ error: "No best sellers found" });
        return;
      }

      const booksWithDiscount = await Promise.all(
        books.map(async (book: IPopulatedBook) => {
          const effectiveDiscount = await BookController.getCategoryDiscount(book);
          const discountedPrice = book.price
            ? book.price * (1 - effectiveDiscount / 100)
            : book.price;
          return { ...book, effectiveDiscount, discountedPrice };
        })
      );

      res.status(200).json(booksWithDiscount);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to fetch best sellers", details: err.message });
    }
  }

  static async getNewArrivals(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookModel.find({ isNewArrival: true }).lean() as IPopulatedBook[];

      if (!books || books.length === 0) {
        res
          .status(404)
          .json({ error: "No new arrivals found" });
        return;
      }

      const booksWithDiscount = await Promise.all(
        books.map(async (book: IPopulatedBook) => {
          const effectiveDiscount = await BookController.getCategoryDiscount(book);
          const discountedPrice = book.price
            ? book.price * (1 - effectiveDiscount / 100)
            : book.price;
          return { ...book, effectiveDiscount, discountedPrice };
        })
      );

      res.status(200).json(booksWithDiscount);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to fetch new arrivals", details: err.message });
    }
  }

  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, tags, seoTitle, seoDescription, discount, parentPath } =
        req.body as {
          name: string;
          tags?: string[];
          seoTitle?: string;
          seoDescription?: string;
          discount?: number;
          parentPath?: string;
        };
      if (!name || !name.trim()) {
        res.status(400).json({ error: "Category name is required" });
        return;
      }

      const formattedName = name.trim().replace(/\s+/g, "-").toLowerCase();
      const path = parentPath
        ? `${parentPath}/${formattedName}`
        : formattedName;
      const existingCategory = await BookCategoryModel.findOne({ path });
      if (existingCategory) {
        res
          .status(400)
          .json({ error: `Category with path '${path}' already exists` });
        return;
      }

    
      const level = path.split('/').length - 1;
      const validatedDiscount = (level <= 2 && discount !== undefined) ? discount : 0;

      const category = new BookCategoryModel({
        name: formattedName,
        path,
        tags: tags
          ? tags.map((tag: string) =>
              tag.trim().replace(/\s+/g, "-").toLowerCase()
            )
          : [],
        children: [],
        books: [],
        seoTitle,
        seoDescription,
        discount: validatedDiscount,
      });
      await category.save();

      if (parentPath) {
        const parent = await BookCategoryModel.findOne({ path: parentPath });
        if (!parent) {
          await BookCategoryModel.deleteOne({ path });
          res
            .status(404)
            .json({ error: `Parent category '${parentPath}' not found` });
          return;
        }
        parent.children.push(category._id);
        await parent.save();
      }


      res.status(201).json(category);
    } catch (err: any) {
      res
        .status(400)
        .json({ error: "Failed to create category", details: err.message });
    }
  }

  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.params;
      const { name, tags, seoTitle, seoDescription, discount } = req.body as {
        name?: string;
        tags?: string[];
        seoTitle?: string;
        seoDescription?: string;
        discount?: number;
      };

      const category = await BookCategoryModel.findOne({ path });
      if (!category) {
        res.status(404).json({ error: `Category '${path}' not found` });
        return;
      }

      if (name && name.trim()) {
        const formattedName = name.trim().replace(/\s+/g, "-").toLowerCase();
        const newPath = category.path
          .split("/")
          .slice(0, -1)
          .concat(formattedName)
          .join("/");
        if (newPath !== category.path) {
          const existing = await BookCategoryModel.findOne({ path: newPath });
          if (existing) {
            res
              .status(400)
              .json({ error: `Category path '${newPath}' already exists` });
            return;
          }
        
          const descendants = await BookCategoryModel.find({
            path: { $regex: `^${category.path}/` },
          });
          for (const descendant of descendants) {
            descendant.path = descendant.path.replace(category.path, newPath);
            await descendant.save();
          }
        
          await BookModel.updateMany(
            { categoryPath: { $regex: `^${category.path}(/|$)` } },
            { $set: { categoryPath: newPath } }
          );
          category.path = newPath;
          category.name = formattedName;
        }
      }

      category.tags = tags
        ? tags.map((tag: string) =>
            tag.trim().replace(/\s+/g, "-").toLowerCase()
          )
        : category.tags;
      category.seoTitle = seoTitle || category.seoTitle;
      category.seoDescription = seoDescription || category.seoDescription;

  
      const level = category.path.split('/').length - 1;
      category.discount = (level <= 2 && discount !== undefined) ? discount : 0;

      await category.save();
      res.status(200).json(category);
    } catch (err: any) {
      res
        .status(400)
        .json({ error: "Failed to update category", details: err.message });
    }
  }

  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.params;
      const category = await BookCategoryModel.findOne({ path });
      if (!category) {
        res.status(404).json({ error: `Category '${path}' not found` });
        return;
      }

  
      await BookCategoryModel.deleteMany({
        path: { $regex: `^${category.path}/` },
      });
      await BookModel.deleteMany({
        categoryPath: { $regex: `^${category.path}(/|$)` },
      });
      await BookCategoryModel.deleteOne({ path });

    
      const parentPath = category.path.split("/").slice(0, -1).join("/");
      if (parentPath) {
        const parent = await BookCategoryModel.findOne({ path: parentPath });
        if (parent) {
          parent.children = parent.children.filter(
            (id: Types.ObjectId) => id.toString() !== category._id.toString()
          );
          await parent.save();
        }
      }

      res
        .status(200)
        .json({ message: "Category and descendants deleted successfully" });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to delete category", details: err.message });
    }
  }

  static async createBook(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.params;
      const {
        title,
        tags,
        seoTitle,
        seoDescription,
        price,
        description,
        estimatedDelivery,
        condition,
        author,
        publisher,
        imageUrl,
        quantityNew,
        quantityOld,
        discountNew,
        discountOld,
        categoryPath,
        isBestSeller,
        isNewArrival,
      } = req.body as {
        title: string;
        tags?: string | string[];
        seoTitle?: string;
        seoDescription?: string;
        price?: number;
        description?: string;
        estimatedDelivery?: string;
        condition?: "new" | "used";
        author?: string;
        publisher?: string;
        imageUrl?: string;
        quantityNew?: number;
        quantityOld?: number;
        discountNew?: number;
        discountOld?: number;
        categoryPath?: string;
        isBestSeller?: boolean;
        isNewArrival?: boolean;
      };

      if (!title || !title.trim()) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      const normalizedPath = decodeURIComponent(path || "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      
      if (categoryPath && !categoryPath.startsWith(normalizedPath)) {
        res.status(400).json({
          error: `Category path in body (${categoryPath}) must start with request path (${normalizedPath})`,
        });
        return;
      }

      const category = await BookCategoryModel.findOne({
        path: normalizedPath,
      });
      if (!category) {
        res
          .status(404)
          .json({ error: `Category '${normalizedPath}' not found` });
        return;
      }

      const book = new BookModel({
        bookName: title.trim(),
        categoryPath: categoryPath || normalizedPath,
        title: title.trim(),
        tags:
          typeof tags === "string"
            ? tags
                .split(",")
                .map((tag: string) =>
                  tag.trim().replace(/\s+/g, "-").toLowerCase()
                )
            : (tags || []).map((tag: string) =>
                tag.trim().replace(/\s+/g, "-").toLowerCase()
              ),
        seoTitle,
        seoDescription,
        price,
        description,
        estimatedDelivery,
        condition,
        author,
        publisher,
        imageUrl,
        quantityNew: quantityNew ?? 0,
        quantityOld: quantityOld ?? 0,
        discountNew: discountNew ?? 0,
        discountOld: discountOld ?? 0,
        isBestSeller: isBestSeller ?? false,
        isNewArrival: isNewArrival ?? false,
      });

      await book.save();
      category.books.push(book._id);
      await category.save();

      
      const effectiveDiscount = await BookController.getCategoryDiscount(book);
      const discountedPrice = book.price
        ? book.price * (1 - effectiveDiscount / 100)
        : book.price;

      res.status(201).json({ ...book.toObject(), effectiveDiscount, discountedPrice });
    } catch (err: any) {
      res
        .status(400)
        .json({ error: "Failed to create book", details: err.message });
    }
  }

  static async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const book = (await BookModel.findById(
        bookId
      ).lean()) as IPopulatedBook | null;
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      const effectiveDiscount = await BookController.getCategoryDiscount(book);
      const discountedPrice = book.price
        ? book.price * (1 - effectiveDiscount / 100)
        : book.price;

      res.status(200).json({ ...book, effectiveDiscount, discountedPrice });
    } catch (err: any) {
      res
        .status(404)
        .json({ error: "Failed to fetch book", details: err.message });
    }
  }

  static async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const { bookId, path } = req.params;
      const {
        title,
        tags,
        seoTitle,
        seoDescription,
        price,
        description,
        estimatedDelivery,
        condition,
        author,
        publisher,
        imageUrl,
        quantityNew,
        quantityOld,
        discountNew,
        discountOld,
        categoryPath,
        isBestSeller,
        isNewArrival,
      } = req.body as {
        title?: string;
        tags?: string | string[];
        seoTitle?: string;
        seoDescription?: string;
        price?: number;
        description?: string;
        estimatedDelivery?: string;
        condition?: "new" | "used";
        author?: string;
        publisher?: string;
        imageUrl?: string;
        quantityNew?: number;
        quantityOld?: number;
        discountNew?: number;
        discountOld?: number;
        categoryPath?: string;
        isBestSeller?: boolean;
        isNewArrival?: boolean;
      };

      const normalizedPath = decodeURIComponent(path || "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      
      if (categoryPath && !categoryPath.startsWith(normalizedPath)) {
        res.status(400).json({
          error: `Category path in body (${categoryPath}) must start with request path (${normalizedPath})`,
        });
        return;
      }

      const book = await BookModel.findById(bookId);
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      const oldCategory = await BookCategoryModel.findOne({
        path: book.categoryPath,
      });
      if (oldCategory) {
        oldCategory.books = oldCategory.books.filter(
          (id: Types.ObjectId) => id.toString() !== bookId
        );
        await oldCategory.save();
      }

      const newCategory = await BookCategoryModel.findOne({
        path: normalizedPath,
      });
      if (!newCategory) {
        res
          .status(404)
          .json({ error: `Category '${normalizedPath}' not found` });
        return;
      }


      if (title && title.trim()) {
        book.bookName = title.trim();
        book.title = title.trim();
      }
      book.tags =
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag: string) =>
                tag.trim().replace(/\s+/g, "-").toLowerCase()
              )
          : (tags || book.tags).map((tag: string) =>
              tag.trim().replace(/\s+/g, "-").toLowerCase()
            );
      book.seoTitle = seoTitle ?? book.seoTitle;
      book.seoDescription = seoDescription ?? book.seoDescription;
      book.price = price ?? book.price;
      book.description = description ?? book.description;
      book.estimatedDelivery = estimatedDelivery ?? book.estimatedDelivery;
      book.condition = condition ?? book.condition;
      book.author = author ?? book.author;
      book.publisher = publisher ?? book.publisher;
      book.imageUrl = imageUrl ?? book.imageUrl;
      book.quantityNew = quantityNew ?? book.quantityNew;
      book.quantityOld = quantityOld ?? book.quantityOld;
      book.discountNew = discountNew ?? book.discountNew;
      book.discountOld = discountOld ?? book.discountOld;
      book.categoryPath = categoryPath || normalizedPath;
      book.isBestSeller = isBestSeller ?? book.isBestSeller;
      book.isNewArrival = isNewArrival ?? book.isNewArrival;

      await book.save();
      newCategory.books.push(book._id);
      await newCategory.save();

  
      const effectiveDiscount = await BookController.getCategoryDiscount(book);
      const discountedPrice = book.price
        ? book.price * (1 - effectiveDiscount / 100)
        : book.price;

      res.status(200).json({ ...book.toObject(), effectiveDiscount, discountedPrice });
    } catch (err: any) {
      res
        .status(400)
        .json({ error: "Failed to update book", details: err.message });
    }
  }

  static async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const book = await BookModel.findByIdAndDelete(bookId);
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      const category = await BookCategoryModel.findOne({
        path: book.categoryPath,
      });
      if (category) {
        category.books = category.books.filter(
          (id: Types.ObjectId) => id.toString() !== bookId
        );
        await category.save();
      }

      res.status(200).json({ message: "Book deleted successfully" });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to delete book", details: err.message });
    }
  }

  static async createTag(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.params;
      const { tag } = req.body as { tag: string };
      if (!tag || !tag.trim()) {
        res.status(400).json({ error: "Tag is required" });
        return;
      }

      const formattedTag = tag.trim().replace(/\s+/g, "-").toLowerCase();
      const category = await BookCategoryModel.findOne({ path });
      if (!category) {
        res.status(404).json({ error: `Category '${path}' not found` });
        return;
      }

      if (category.tags.some((t: string) => t.toLowerCase() === formattedTag)) {
        res.status(400).json({ error: "Tag already exists" });
        return;
      }

      category.tags.push(formattedTag);
      await category.save();
      res.status(201).json({ tags: category.tags });
    } catch (err: any) {
      res
        .status(400)
        .json({ error: "Failed to create tag", details: err.message });
    }
  }

  static async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      const { path, tagName } = req.params;
      const category = await BookCategoryModel.findOne({ path });
      if (!category) {
        res.status(404).json({ error: `Category '${path}' not found` });
        return;
      }

      category.tags = category.tags.filter(
        (t: string) => t.toLowerCase() !== tagName.toLowerCase()
      );
      await category.save();
      res.status(200).json({ tags: category.tags });
    } catch (err: any) {
      res
        .status(400)
        .json({ error: "Failed to delete tag", details: err.message });
    }
  }

  static async deleteAllCategories(req: Request, res: Response): Promise<void> {
    try {
      await BookCategoryModel.deleteMany({});
      await BookModel.deleteMany({});
      res
        .status(200)
        .json({ message: "All categories and books deleted successfully" });
    } catch (err: any) {
      res
        .status(500)
        .json({
          error: "Failed to delete all categories",
          details: err.message,
        });
    }
  }

  static async deleteAllBooks(req: Request, res: Response): Promise<void> {
    try {
      await BookModel.deleteMany({});
      await BookCategoryModel.updateMany({}, { $set: { books: [] } });
      res.status(200).json({ message: "All books deleted successfully" });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to delete books", details: err.message });
    }
  }
}

export default BookController;