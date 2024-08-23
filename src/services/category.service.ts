import { prismaClient } from "../config/prisma";
import { UserJWT } from "../model/authModel";
import dayjs from "dayjs";
import { BookListModel, BookModel } from "../model/bookModel";

const newDate = dayjs().add(7, "hour").toDate();

const methods = {
  async CategoryList() {
    return new Promise(async (resolve, reject) => {
      try {
        const list = await prismaClient.category.findMany({
          select: {
            id: true,
            name: true,
          },
        });
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
          select: {
            id: true,
            name: true,
          },
        });
        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getCategoryById(category_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get = await prismaClient.category.findUnique({
          where: {
            id: category_id,
          },
          select: {
            id: true,
            name: true,
          },
        });
        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async createCategory(name: string, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const create = await prismaClient.category.create({
          data: {
            name: name,
            created_by: user.user_id,
            created_at: newDate,
            updated_by: user.user_id,
            updated_at: newDate,
          },
        });
        resolve(create);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async updateCategory(name: string, id: string, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const update = await prismaClient.category.update({
          where: {
            id: id,
          },
          data: {
            name: name,
            updated_by: user.user_id,
            updated_at: newDate,
          },
        });
        resolve(update);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async deleteCategory(id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const delete_category = await prismaClient.category.delete({
          where: {
            id: id,
          },
        });
        resolve(delete_category);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async removeCategoryFromBook(category_id: string, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const find_book = (await prismaClient.book.findMany({
          where: {
            category_ids: {
              path: [],
              array_contains: [category_id],
            },
          },
        })) as BookListModel;

        if (find_book.length === 0)
          return resolve({
            message: "successfully remove from book",
            book_update: 0,
          });

        const update_book_promise = find_book.map((book: BookModel) => {
          const updated_category = book.category_ids.filter(
            (id: string) => id !== category_id
          );
          return prismaClient.book.update({
            where: {
              id: book.id,
            },
            data: {
              category_ids: updated_category,
              updated_at: newDate,
              updated_by: user.user_id,
            },
          });
        });

        const remove_category_from_book = await Promise.all(
          update_book_promise
        );

        resolve({
          message: "successfully remove from book",
          book_update: remove_category_from_book.length,
          book: remove_category_from_book,
        });
      } catch (err: any) {
        reject(err);
      }
    });
  },
};

export default { ...methods };
