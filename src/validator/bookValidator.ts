import { body, param, query } from "express-validator";
import { validate } from "uuid";

export const viewBookByIdValidation = [
  param("book_id")
    .isString()
    .withMessage("book_id must be uuid")
    .notEmpty()
    .withMessage("book_id is required"),
];

export const searchBookValidation = [
  query("title").optional().isString().withMessage("title must be string"),
  query("author").optional().isString().withMessage("author must be string"),
  query("category_id")
    .optional()
    .isString()
    .withMessage("category_ids must be array")
    .custom((value) => {
      if (!value) return true;
      const ids = value.split(",");
      return ids.every((id: string) => validate(id.trim()));
    })
    .withMessage("category_ids must be comma-separated valid UUIDs"),
  query("page").optional().isNumeric().withMessage("page must be number"),
  query("page_size")
    .optional()
    .isNumeric()
    .withMessage("page_size must be number"),
];

export const createBookValidation = [
  body("title").isString().notEmpty().withMessage("title is required"),
  body("author").isString().notEmpty().withMessage("author is required"),
  body("category_ids")
    .isArray()
    .withMessage("category_ids must be Array")
    .notEmpty()
    .withMessage("category_ids is required"),
  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("quantity must be number"),
  body("isbn").isString().notEmpty().withMessage("isbn is required"),
];

export const updateBookValidation = [
  param("book_id")
    .isUUID()
    .withMessage("book_id must be uuid")
    .notEmpty()
    .withMessage("book_id is required"),
  body("title").isString().notEmpty().withMessage("title is required"),
  body("author").isString().notEmpty().withMessage("author is required"),
  body("category_ids")
    .isArray()
    .withMessage("category_ids must be Array")
    .notEmpty()
    .withMessage("category_ids is required"),
  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("quantity must be number"),
  body("isbn").isString().notEmpty().withMessage("isbn is required"),
];

export const deleteBookValidation = [
  param("book_id")
    .isUUID()
    .withMessage("book_id must be uuid")
    .notEmpty()
    .withMessage("book_id is required"),
];
