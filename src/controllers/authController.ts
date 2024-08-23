import { Request, Response, response } from "express";
import { prismaClient } from "../config/prisma";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import responseMethod from "../services/responseMethod";
import authService from "../services/auth.service";
import * as tools from "../services/tools";
import { UserModel, UserJWT, searchUserModel } from "../model/authModel";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { BorrowListModel } from "../model/circulationModel";

export const check = async (req: Request, res: Response) => {
  try {
    const result = await prismaClient.$queryRaw`SELECT NOW()`;

    res.json({
      success: true,
      results: result,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const userList = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, role } = req.query;
  const page = Number(req.query.page) || 1;
  const page_size = Number(req.query.page_size) || 10;
  try {
    let search_role: any;
    switch (Number(role)) {
      case 1:
        search_role = "user";
        break;
      case 2:
        search_role = "admin";
        break;
    }
    console.log(search_role);
    const search_params: searchUserModel = {
      username: username as string,
      role: search_role,
    };
    const get_list: any = await authService.getUserList(
      search_params,
      page,
      page_size
    );

    res.json({
      success: true,
      pagination: get_list.pagination,
      result: get_list.list,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const Register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const get_user = (await authService.getUserByName(username)) as UserModel;

    if (get_user)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("this username already have!"));

    await authService.Register(username, password);
    res.json({
      success: true,
      result: "register successfully",
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const Login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const get_username = (await authService.getUserByName(
      username
    )) as UserModel;

    if (!get_username || !bcrypt.compareSync(password, get_username.password))
      return res
        .status(400)
        .json(responseMethod.Unauthorize(`wrong username or password`));

    const token_id = uuid();

    const token = (await tools.signJWT({
      user_id: get_username.id,
      username: get_username.username,
      role: get_username.role,
      token_id: token_id,
    })) as string;

    const refresh_token = (await tools.reFreshTokenJWT({
      user_id: get_username.id,
      token_id: token_id,
    })) as string;

    await authService.saveRefreshToken(refresh_token, get_username.id);

    res.json({
      success: true,
      result: {
        access_token: token,
        refresh_token: refresh_token,
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const get_user = (await authService.getUserById(user.user_id)) as UserModel;

    if (!get_user.refresh_token)
      return res.status(400).json(responseMethod.Unauthorize(`Invalid Token`));

    const token_id = uuid();

    const token = (await tools.signJWT({
      user_id: get_user.id,
      username: get_user.username,
      role: get_user.role,
      token_id: token_id,
    })) as string;

    const refresh_token = (await tools.reFreshTokenJWT({
      user_id: get_user.id,
      token_id: token_id,
    })) as string;

    await authService.saveRefreshToken(refresh_token, get_user.id);

    res.json({
      success: true,
      result: {
        access_token: token,
        refresh_token: refresh_token,
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const logOut = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const get_user = (await authService.getUserById(user.user_id)) as UserModel;

    if (!get_user)
      return res.status(404).json(responseMethod.NotFound("user not found"));

    await authService.saveRefreshToken(null, get_user.id);

    res.json({
      success: true,
      message: "logout successfully",
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const editUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { user_id } = req.params;
  const { username, password, role } = req.body as UserModel;
  const user = (req as any).user;
  try {
    const get_user = (await authService.getUserById(user_id)) as UserModel;

    if (!get_user)
      return res.status(404).json(responseMethod.NotFound("user not found"));

    if (username) {
      const get_username = (await authService.getUserByName(
        username
      )) as UserModel;

      if (get_username && get_username.id != user_id)
        return res
          .status(400)
          .json(responseMethod.InvalidRequest("username is duplicate"));
    }

    let user_role: "user" | "admin" = "user";
    switch (Number(role)) {
      case 1:
        user_role = "user";
        break;
      case 2:
        user_role = "admin";
        break;
    }

    const user_data: UserModel = {
      id: user_id,
      username: username,
      password: password,
      role: user_role,
    };

    const update = await authService.editUser(user_data, user);

    res.json({
      success: true,
      message: `edit user ${get_user.username} successfully`,
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { user_id } = req.params;
  const user = (req as any).user;
  try {
    const get_user = (await authService.getUserById(user_id)) as UserModel;

    if (!get_user)
      return res.status(404).json(responseMethod.NotFound("user not found"));

    const find_borrow = (await authService.checkBorrowUser(
      user_id
    )) as BorrowListModel;

    if (find_borrow && find_borrow.length > 0)
      return res
        .status(400)
        .json(
          responseMethod.InvalidRequest(
            `user is still on loan. ${find_borrow.length} left`
          )
        );

    const delete_user_borrow: any = await authService.deleteUserIsRelateBorrow(
      user_id
    );

    await authService.deleteUser(user_id);

    res.json({
      success: true,
      message: `delete user ${get_user.username} successfully`,
      result: {
        message: `delete borrow_book ${delete_user_borrow.count} items`,
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};
