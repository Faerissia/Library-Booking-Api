import { Request, Response, response } from "express";
import { validationResult } from "express-validator";
import responseMethod from "../services/responseMethod";
import categoryService from "../services/category.service";
import { CategoryModel } from "../model/categoryModel";

export const ListCategory = async (req: Request, res: Response) => {
  try {
    const list = await categoryService.CategoryList();
    res.json({
      success: true,
      result: list,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const CreateCategory = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = (req as any).user;
  const { name } = req.body;
  try {
    const get_category = (await categoryService.getCategoryByName(
      name
    )) as CategoryModel;

    if (get_category)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("category name is duplicate"));

    await categoryService.createCategory(name, user);
    res.json({
      success: true,
      message: `create Category name ${name} successfully`,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const UpdateCategory = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const user = (req as any).user;
  const { category_id } = req.params;
  const { name } = req.body;
  try {
    const get_category = (await categoryService.getCategoryById(
      category_id
    )) as CategoryModel;

    if (!get_category)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("category not found"));

    const get_category_name = (await categoryService.getCategoryByName(
      name
    )) as CategoryModel;

    if (get_category_name && get_category_name.id != category_id)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("category name is duplicate"));

    await categoryService.updateCategory(name, category_id, user);

    res.json({
      success: true,
      message: `update Category ${get_category.name} to ${name} successfully`,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { category_id } = req.params;
  const user = (req as any).user;
  try {
    const get_category = (await categoryService.getCategoryById(
      category_id
    )) as CategoryModel;

    if (!get_category)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("category not found"));

    const remove_book_category = await categoryService.removeCategoryFromBook(
      category_id,
      user
    );

    await categoryService.deleteCategory(category_id);

    res.json({
      success: true,
      message: `delete category ${get_category.name} successfully`,
      result: remove_book_category,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};
