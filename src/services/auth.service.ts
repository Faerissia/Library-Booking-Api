import { prismaClient } from "../config/prisma";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { UserJWT, UserModel, searchUserModel } from "../model/authModel";

const newDate = dayjs().add(7, "hour").toDate();

const methods = {
  async getUserList(
    search_params: searchUserModel,
    page: number,
    page_size: number
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const where: any = {};

        if (search_params.username) {
          where.username = {
            contains: search_params.username,
            mode: "insensitive",
          };
        }

        if (search_params.role !== undefined && search_params.role !== null) {
          where.role = search_params.role;
        }

        const total_count = await prismaClient.user.count({
          where: where,
        });
        const list = await prismaClient.user.findMany({
          where: where,
          skip: (page - 1) * page_size,
          take: page_size,
        });
        resolve({
          list,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(total_count / page_size),
            page_size: page_size,
            total_count: total_count,
          },
        });
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getUserById(user_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get = await prismaClient.user.findUnique({
          where: {
            id: user_id,
          },
        });
        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getUserByName(username: string) {
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
            created_at: newDate,
            updated_at: newDate,
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
  async saveRefreshToken(refresh_token: string | null, user_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const update = await prismaClient.user.update({
          where: {
            id: user_id,
          },
          data: {
            refresh_token: refresh_token,
            updated_at: newDate,
          },
        });
        resolve(update);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async editUser(user_data: UserModel, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const update_data: any = {
          updated_by: user.user_id,
          updated_at: newDate,
        };

        if (user_data.username !== undefined)
          update_data.username = user_data.username;
        if (user_data.password !== undefined)
          update_data.password = await bcrypt.hash(user_data.password, 10);
        if (user_data.role !== undefined) update_data.role = user_data.role;

        const update = await prismaClient.user.update({
          where: {
            id: user_data.id,
          },
          data: update_data,
        });

        resolve(update);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async deleteUser(user_uuid: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const delete_user = await prismaClient.user.delete({
          where: {
            id: user_uuid,
          },
        });

        resolve(delete_user);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async checkBorrowUser(user_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const check_borrow = await prismaClient.borrow_book.findMany({
          where: {
            user_id: user_id,
            return_date: null,
          },
        });
        resolve(check_borrow);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async deleteUserIsRelateBorrow(user_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const delete_user_borrow = await prismaClient.borrow_book.deleteMany({
          where: {
            user_id: user_id,
          },
        });
        resolve(delete_user_borrow);
      } catch (err: any) {
        reject(err);
      }
    });
  },
};

export default { ...methods };
