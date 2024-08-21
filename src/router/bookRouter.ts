import express from "express";
import * as tools from "../services/tools";
import * as bookController from "../controllers/bookController";
import * as bookValidator from "../validator/bookValidator";

const router = express.Router();

router.get("/", bookController.getBookList);

router.get(
  "/(:book_id)",
  bookValidator.viewBookByIdValidation,
  bookController.viewBook
);

router.post(
  "/",
  tools.authenticate,
  tools.authorize(["admin"]),
  bookValidator.createBookValidation,
  bookController.createBook
);

router.put(
  "/(:book_id)",
  tools.authenticate,
  tools.authorize(["admin"]),
  bookValidator.updateBookValidation,
  bookController.updateBook
);

export = router;
