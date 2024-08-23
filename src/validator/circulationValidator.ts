import { body, param, query } from "express-validator";

export const borrowListValidation = [
  query("status")
    .optional()
    .isFloat({ min: 1, max: 2 })
    .withMessage("status must ne number and range 1 or 2"),
  query("page").optional().isNumeric().withMessage("page must be number"),
  query("page_size")
    .optional()
    .isNumeric()
    .withMessage("page_size must be number"),
];

export const borrowBookValidation = [
  body("book_id")
    .isUUID()
    .withMessage("book_id must be uuid")
    .notEmpty()
    .withMessage("book_id is required"),
];

export const returnBookValidation = [
  param("borrow_id")
    .isUUID()
    .withMessage("borrow_id must be uuid")
    .notEmpty()
    .withMessage("borrow_id is required"),
];

export const deleteBorrowValidation = [
  param("borrow_id")
    .isUUID()
    .withMessage("borrow_id must be uuid")
    .notEmpty()
    .withMessage("borrow_id is required"),
];

export const editBookValidation = [
  param("borrow_id")
    .isUUID()
    .withMessage("borrow_id must be uuid")
    .notEmpty()
    .withMessage("borrow_id is required"),
  body("user_id").optional().isUUID().withMessage("user_id must be uuid"),
  body("book_id").optional().isUUID().withMessage("book_id must be uuid"),
  body("borrow_date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("borrow_date must be date"),
  body("due_date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("due_date must be date"),
  body("return_date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("return_date must be date"),
];
