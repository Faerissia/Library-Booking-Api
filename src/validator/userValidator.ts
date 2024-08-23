import { body, param, query } from "express-validator";

export const userListValidation = [
  query("username")
    .optional()
    .isString()
    .withMessage("username must be string"),
  query("role")
    .optional()
    .isFloat({ min: 1, max: 2 })
    .withMessage("role must be number and rage 1 or 2"),
  query("page").optional().isNumeric().withMessage("page must be number"),
  query("page_size")
    .optional()
    .isNumeric()
    .withMessage("page_size must be number"),
];

export const editValidation = [
  param("user_id").isUUID().notEmpty().withMessage("user_id must be uuid"),
  body("username").optional().isString().withMessage("username must be string"),
  body("password")
    .optional()
    .isString()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Confirm password does not match password");
    }
    return true;
  }),
  body("role")
    .optional()
    .isFloat({ min: 1, max: 2 })
    .withMessage("role must be number and range 1 or 2"),
];

export const deleteValidation = [
  param("user_id").isUUID().notEmpty().withMessage("user_id must be uuid"),
];

export const loginValidation = [
  body("username").isString().notEmpty().withMessage("username is required"),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const registerValidation = [
  body("username").isString().notEmpty().withMessage("username is required"),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Confirm password does not match password");
    }
    return true;
  }),
];
