import { body, param } from "express-validator";

export const viewBookByIdValidation = [
  param("book_id").isString().notEmpty().withMessage("book_id is required"),
];

export const createBookValidation = [
  body("title").isString().notEmpty().withMessage("title is required"),
  body("author").isString().notEmpty().withMessage("author is required"),
  body("category_id")
    .isString()
    .notEmpty()
    .withMessage("category_id is required"),
  body("quantity").isNumeric().withMessage("quantity must be number"),
  body("isbn").isString().notEmpty().withMessage("isbn is required"),
];
