import express from "express";
import * as tools from "../services/tools";
import * as categoryController from "../controllers/categoryController";
import * as categoryValidator from "../validator/categoryValidator";

const router = express.Router();

router.get("/", categoryController.ListCategory);
router.post(
  "/",
  tools.authenticate,
  tools.authorize(["admin"]),
  categoryValidator.createCategoryValidation,
  categoryController.CreateCategory
);
router.put(
  "/(:category_id)",
  tools.authenticate,
  tools.authorize(["admin"]),
  categoryValidator.updateCategoryValidation,
  categoryController.UpdateCategory
);

router.delete(
  "/(:category_id)",
  tools.authenticate,
  tools.authorize(["admin"]),
  categoryValidator.deleteCategoryValidation,
  categoryController.deleteCategory
);

export = router;
