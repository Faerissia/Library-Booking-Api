import { body, param } from "express-validator";

export const createCategoryValidation = [
  body("name").isString().notEmpty().withMessage("name is required"),
];

export const updateCategoryValidation = [
  param("category_id")
    .isString()
    .notEmpty()
    .withMessage("category_id is required"),
  body("name").isString().notEmpty().withMessage("name is required"),
];
