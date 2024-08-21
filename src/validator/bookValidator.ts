import { body, param } from "express-validator";

export const viewBookByIdValidation = [
  param("book_id").isString().notEmpty().withMessage("book_id is required"),
];

export const createBookValidation = [
  body("title").isString().notEmpty().withMessage("title is required"),
  body("author").isString().notEmpty().withMessage("author is required"),
  body("category_ids")
    .isArray()
    .withMessage("category_ids must be Array")
    .notEmpty()
    .withMessage("category_ids is required"),
  body("quantity").isNumeric().withMessage("quantity must be number"),
  body("isbn").isString().notEmpty().withMessage("isbn is required"),
];

export const updateBookValidation = [
  param("book_id").isString().notEmpty().withMessage("book_id is required"),
  body("title").isString().notEmpty().withMessage("title is required"),
  body("author").isString().notEmpty().withMessage("author is required"),
  body("category_ids")
    .isArray()
    .withMessage("category_ids must be Array")
    .notEmpty()
    .withMessage("category_ids is required"),
  body("quantity").isNumeric().withMessage("quantity must be number"),
  body("isbn").isString().notEmpty().withMessage("isbn is required"),
];
