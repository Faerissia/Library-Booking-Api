import { prismaClient } from "../config/prisma";
import * as authModel from "../model/authModel";

const methods = {
  async CategoryList() {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await prismaClient.category.findMany({});
        resolve(list);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getCategoryByName(name: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get = await prismaClient.category.findUnique({
          where: {
            name: name,
          },
        });
        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async createCategory(name: string, user: authModel.UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const create = await prismaClient.category.create({
          data: {
            name: name,
            created_by: user.user_id,
            updated_by: user.user_id,
          },
        });
        resolve(create);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async updateCategory(name: string, id: string, user: authModel.UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const update = await prismaClient.category.update({
          where: {
            id: id,
          },
          data: {
            name: name,
            updated_by: user.user_id,
            updated_at: new Date(),
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
