import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, UserJWT } from "../model/authModel";
import { prismaClient } from "../config/prisma";
import dayjs from "dayjs";

export const signJWT = async (data: any) => {
  try {
    const token = jwt.sign(data, process.env.JWT_TOKEN_SECRET as string, {
      expiresIn: process.env.ACCESS_EXPIRY,
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

export const reFreshTokenJWT = async (data: any) => {
  try {
    const token = jwt.sign(
      data,
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: process.env.REFRESH_EXPIRY,
      }
    );
    return token;
  } catch (error) {
    console.log(error);
  }
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET as string
    ) as UserJWT;

    const refresh_token = await prismaClient.user.findUnique({
      where: {
        id: decoded.user_id,
      },
      select: {
        refresh_token: true,
      },
    });

    const decoded_refresh = jwt.verify(
      refresh_token?.refresh_token as string,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    ) as UserJWT;

    if (!refresh_token || decoded.token_id !== decoded_refresh.token_id)
      return res.status(403).json({ message: "access denied" });

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export const refreshTokenValidate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    ) as {
      user_id: string;
      username: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
