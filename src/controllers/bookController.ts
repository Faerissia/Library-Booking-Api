import { Request, Response, response } from "express";
import { validationResult } from "express-validator";
import responseMethod from "../services/responseMethod";
import * as tools from "../services/tools";
import bookService from "../services/book.service";
import { BookListModel, BookModel, searchBookModel } from "../model/bookModel";
import { BorrowListModel } from "../model/circulationModel";

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
      result: view ? view : "not found",
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const searchBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, author, category_id } = req.query;
  const page = Number(req.query.page) || 1;
  const page_size = Number(req.query.page_size) || 10;
  try {
    const search_query: searchBookModel = {
      title: title as string,
      author: author as string,
      category_ids: category_id
        ? (category_id as string).split(",")
        : undefined,
    };
    const search: any = await bookService.searchBook(
      search_query,
      page,
      page_size
    );
    res.json({
      success: true,
      pagination: search.pagination,
      result: search.get,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const createBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = (req as any).user;
  const { title, author, category_ids, quantity, isbn }: BookModel = req.body;
  try {
    const get_book = (await bookService.getBookByName(title)) as BookModel;

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
      message: `create book ${title} successfully`,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = (req as any).user;
  const { title, author, category_ids, quantity, isbn }: BookModel = req.body;
  const { book_id } = req.params;
  try {
    const get_book = (await bookService.getBookByName(title)) as BookModel;
    if (get_book && book_id != get_book.id)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("book title is duplicate"));

    await bookService.updateBook(
      {
        id: book_id,
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
      message: `update book ${title} successfully`,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = (req as any).user;
  const { book_id } = req.params;
  try {
    const get_book = (await bookService.getBookById(book_id)) as BookModel;

    if (!get_book)
      return res.status(404).json(responseMethod.NotFound("book not found"));

    const check_borrow = (await bookService.checkBorrowBook(
      book_id
    )) as BorrowListModel;

    if (check_borrow && check_borrow.length > 0)
      return res
        .status(400)
        .json(
          responseMethod.InvalidRequest(
            `This book is still on loan. ${check_borrow.length} left`
          )
        );

    const delete_book_borrow: any = await bookService.deleteBookIsRelateBorrow(
      book_id
    );

    await bookService.deleteBook(book_id);

    res.json({
      success: true,
      message: `delete book ${get_book.title} successfully`,
      result: {
        message: `delete borrow_book ${delete_book_borrow.count} items`,
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};
