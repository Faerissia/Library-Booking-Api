import { Request, Response, response } from "express";
import { validationResult } from "express-validator";
import responseMethod from "../services/responseMethod";
import * as tools from "../services/tools";
import bookService from "../services/book.service";
import { BookListModel, BookModel } from "../model/bookModel";

export const getBookList = async (req: Request, res: Response) => {
  try {
    const get_list = (await bookService.bookList()) as BookListModel;

    res.json({
      success: true,
      data: {
        results: get_list,
      },
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
  }
};

export const viewBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { book_id } = req.params;
  try {
    const view = await bookService.getBookById(book_id);

    res.json({
      success: true,
      data: {
        results: view,
      },
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
  }
};

export const createBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = (req as any).user;
  const { title, author, category_ids, quantity, isbn } = req.body;
  try {
    const get_book = await bookService.getBookByName(title);
    if (get_book)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("book title is duplicate"));

    await bookService.createBook(
      {
        title,
        author,
        category_ids,
        quantity,
        isbn,
      },
      user
    );
    res.json({
      success: true,
      data: {
        results: `create book ${title} successfully`,
      },
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = (req as any).user;
  const { title, author, category_ids, quantity, isbn } = req.body;
  const { book_id } = req.params;
  try {
    const get_book = await bookService.getBookByName(title);
    if (get_book)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("book title is duplicate"));

    await bookService.createBook(
      {
        title,
        author,
        category_ids,
        quantity,
        isbn,
      },
      user
    );
    res.json({
      success: true,
      data: {
        results: `create book ${title} successfully`,
      },
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
  }
};
