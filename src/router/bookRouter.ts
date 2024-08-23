import express from "express";
import * as tools from "../services/tools";
import * as bookController from "../controllers/bookController";
import * as bookValidator from "../validator/bookValidator";

const router = express.Router();

router.get(
  "/view/(:book_id)",
  bookValidator.viewBookByIdValidation,
  bookController.viewBook
);

router.get("/", bookValidator.searchBookValidation, bookController.searchBook);

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

router.delete(
  "/(:book_id)",
  tools.authenticate,
  tools.authorize(["admin"]),
  bookValidator.deleteBookValidation,
  bookController.deleteBook
);

export = router;
