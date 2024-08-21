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
      data: {
        results: list,
      },
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
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
      data: {
        results: `create Category name ${name} successfully`,
      },
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
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
    const get_category = (await categoryService.getCategoryByName(
      name
    )) as CategoryModel;

    if (get_category && get_category.id != category_id)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("category name is duplicate"));

    await categoryService.updateCategory(name, category_id, user);

    res.json({
      success: true,
      data: {
        results: "update Category successfully",
      },
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
  }
};
