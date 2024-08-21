import { Request, Response, response } from "express";
import { prismaClient } from "../config/prisma";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import responseMethod from "../services/responseMethod";
import authService from "../services/auth.service";
import * as tools from "../services/tools";
import { UserModel, UserJWT } from "../model/authModel";

export const check = async (req: Request, res: Response) => {
  try {
    const result = await prismaClient.$queryRaw`SELECT NOW()`;

    res.json({
      success: true,
      data: {
        results: result,
      },
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
    const get_user = (await authService.getUserByUsername(
      username
    )) as UserModel;

    if (get_user)
      return res
        .status(400)
        .json(responseMethod.InvalidRequest("this username already have!"));

    await authService.Register(username, password);
    res.json({
      success: true,
      data: {
        results: "register successfully",
      },
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
    const get_username = (await authService.getUser(username)) as UserModel;

    if (!get_username || !bcrypt.compareSync(password, get_username.password))
      return res
        .status(400)
        .json(responseMethod.Unauthorize(`wrong username or password`));

    const token = (await tools.signJWT({
      user_id: get_username.id,
      username: get_username.username,
      role: get_username.role,
    })) as string;

    const refresh_token = (await tools.reFreshTokenJWT({
      user_id: get_username.id,
      username: get_username.username,
      role: get_username.role,
    })) as string;

    await authService.saveRefreshToken(refresh_token, get_username.id);

    res.json({
      success: true,
      data: {
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
    const get_user = (await authService.getUser(user.username)) as UserModel;

    if (!get_user.refresh_token)
      return res.status(400).json(responseMethod.Unauthorize(`Invalid Token`));

    const token = (await tools.signJWT({
      user_id: get_user.id,
      username: get_user.username,
      role: get_user.role,
    })) as string;

    const refresh_token = (await tools.reFreshTokenJWT({
      user_id: get_user.id,
      username: get_user.username,
      role: get_user.role,
    })) as string;

    await authService.saveRefreshToken(refresh_token, get_user.id);

    res.json({
      success: true,
      data: {
        access_token: token,
        refresh_token: refresh_token,
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(err?.error?.httpStatusCode || 500).json(err?.error);
  }
};
