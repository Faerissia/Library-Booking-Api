import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { user_id: string; username: string; role: string };
}

export interface searchUserModel {
  username?: string;
  role: "user" | "admin";
}

export interface UserJWT {
  user_id: string;
  username: string;
  role: string;
  token_id: string;
}

export interface UserModel {
  id: string;
  username: string;
  password: string;
  role: "user" | "admin";
  refresh_token?: string;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;
}
