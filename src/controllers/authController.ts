import { Request, Response, response } from "express";
import { prismaClient } from "../config/prisma";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import responseMethod from "../services/responseMethod";
import authService from "../services/auth.service";
import * as tools from "../services/tools";
import { UserModel } from "../model/authModel";

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
    res.status(500).json(err);
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
    res.status(500).json(err);
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

    const token = await tools.signJWT({
      user_id: get_username.id,
      username: get_username.username,
      role: get_username.role,
    });

    res.json({
      success: true,
      data: {
        results: token,
      },
    });
  } catch (err: any) {
    console.log("Error:", err);
    res.status(500).json(err);
  }
};
