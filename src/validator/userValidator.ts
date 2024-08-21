import { body } from "express-validator";

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
