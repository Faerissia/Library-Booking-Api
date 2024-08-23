import { Request, Response, response } from "express";
import { validationResult } from "express-validator";
import responseMethod from "../services/responseMethod";
import circulationService from "../services/circulation.service";
import bookService from "../services/book.service";
import { BorrowModel, checkIsLateModel } from "../model/circulationModel";
import { BookModel } from "../model/bookModel";
import authService from "../services/auth.service";

export const getBorrowList = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const status = Number(req.query.status);
  const page = Number(req.query.page) || 1;
  const page_size = Number(req.query.page_size) || 10;
  const user = (req as any).user;
  try {
    let query: "overdue" | "borrow" | null = null;
    switch (status) {
      case 1:
        query = "overdue";
        break;
      case 2:
        query = "borrow";
        break;
    }
    const list: any = await circulationService.getBorrowList(
      page,
      page_size,
      user,
      query
    );
    res.json({
      success: true,
      pagination: list.pagination,
      result: list.filter_result,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const borrowBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { book_id } = req.body;
  const user = (req as any).user;
  try {
    const get_book = (await bookService.getBookById(book_id)) as BookModel;

    if (!get_book || get_book.quantity === 0)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("book is not available"));

    await bookService.updateQuantityBook(book_id, -1);

    const borrow = (await circulationService.borrow(
      book_id,
      user
    )) as BorrowModel;
    res.json({
      success: true,
      message: "successfully borrow book",
      result: {
        borrow_date: borrow.borrow_date,
        due_date: borrow.due_date,
        book: {
          title: get_book.title,
          author: get_book.author,
          categories: get_book.category_ids,
          isbn: get_book.isbn,
        },
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const returnBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { borrow_id } = req.params;
  const user = (req as any).user;
  try {
    const find = (await circulationService.getBorrowById(
      borrow_id
    )) as BorrowModel;

    if (find.return_date)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("this book has already return"));

    const return_book = (await circulationService.returnBook(
      borrow_id as string,
      user
    )) as BorrowModel;

    await bookService.updateQuantityBook(find.book_id, +1);

    const isLate = (await circulationService.checkIsLate(
      return_book.return_date as Date,
      return_book.due_date
    )) as checkIsLateModel;

    res.json({
      success: true,
      message: `return book ${find.book?.title} successfully`,
      result: {
        ...return_book,
        isLate: isLate.is_late,
        status: isLate.status,
        dayLeft: isLate.dayLeft,
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const editBook = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { borrow_id } = req.params;
  const { user_id, book_id, borrow_date, due_date, return_date } =
    req.body as BorrowModel;
  const user = (req as any).user;
  try {
    const find = (await circulationService.getBorrowById(
      borrow_id
    )) as Partial<BorrowModel>;

    if (!find)
      return res.status(404).json(responseMethod.NotFound("borrow not found"));

    if (book_id) {
      const find_book = await bookService.getBookById(book_id);
      if (!find_book)
        return res.status(404).json(responseMethod.NotFound("book not found"));
    }

    if (user_id) {
      const find_user = await authService.getUserById(user_id);
      if (!find_user)
        return res.status(404).json(responseMethod.NotFound("user not found"));
    }

    const borrow_data: Partial<BorrowModel> = {
      id: borrow_id,
      user_id,
      book_id,
      borrow_date,
      due_date,
      return_date,
    };

    const edit = await circulationService.editBorrow(borrow_data, user);

    res.json({
      success: true,
      message: `update borrow successfully`,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const deleteBorrow = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { borrow_id } = req.params;
  const user = (req as any).user;
  try {
    const find = (await circulationService.getBorrowById(
      borrow_id
    )) as Partial<BorrowModel>;

    if (!find)
      return res.status(404).json(responseMethod.NotFound("borrow not found"));

    if (!find.return_date)
      return res
        .status(404)
        .json(responseMethod.NotFound("this borrow still on loan"));

    const delete_borrow = await circulationService.deleteBorrow(borrow_id);

    res.json({
      success: true,
      message: `delete borrow successfully`,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const getMostBorrowedBook = async (req: Request, res: Response) => {
  try {
    const get = await circulationService.getMostBorrowBook();
    res.json({
      success: true,
      result: get,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};
