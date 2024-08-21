import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { user_id: string; username: string; role: string };
}

export interface UserJWT {
  user_id: string;
  username: string;
  role: string;
}

export interface UserModel {
  id: string;
  username: string;
  password: string;
  role: string;
  refresh_token: string;
  refresh_token_expiry_date: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
}
