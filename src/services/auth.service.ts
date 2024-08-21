import { prismaClient } from "../config/prisma";
import bcrypt from "bcrypt";

const methods = {
  async getUserByUsername(username: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get = await prismaClient.user.findUnique({
          where: {
            username: username,
          },
        });
        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async Register(username: string, password: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const hashPws = await bcrypt.hash(password, 10);
        const create = await prismaClient.user.create({
          data: {
            username: username,
            password: hashPws,
            role: "user",
          },
          select: {
            username: true,
            role: true,
          },
        });
        resolve(create);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getUser(username: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const find_user = await prismaClient.user.findUnique({
          where: {
            username: username,
          },
        });
        resolve(find_user);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async saveRefreshToken(refresh_token: string, user_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const update = await prismaClient.user.update({
          where: {
            id: user_id,
          },
          data: {
            refresh_token: refresh_token,
          },
        });
        resolve(update);
      } catch (err: any) {
        reject(err);
      }
    });
  },
};

export default { ...methods };
