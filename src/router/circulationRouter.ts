import express from "express";
import * as tools from "../services/tools";
import * as circulationController from "../controllers/circulationController";
import * as circulationValidator from "../validator/circulationValidator";

const router = express.Router();

router.get(
  "/",
  tools.authenticate,
  tools.authorize(["user", "admin"]),
  circulationValidator.borrowListValidation,
  circulationController.getBorrowList
);

router.post(
  "/",
  tools.authenticate,
  tools.authorize(["user", "admin"]),
  circulationValidator.borrowBookValidation,
  circulationController.borrowBook
);

router.put(
  "/(:borrow_id)",
  tools.authenticate,
  tools.authorize(["user", "admin"]),
  circulationValidator.returnBookValidation,
  circulationController.returnBook
);

router.delete(
  "/(:borrow_id)",
  tools.authenticate,
  tools.authorize(["admin"]),
  circulationValidator.deleteBorrowValidation,
  circulationController.deleteBorrow
);

router.put(
  "/edit/(:borrow_id)",
  tools.authenticate,
  tools.authorize(["user", "admin"]),
  circulationValidator.editBookValidation,
  circulationController.editBook
);

router.get("/most-borrow", circulationController.getMostBorrowedBook);

export = router;
