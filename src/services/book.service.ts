import { prismaClient } from "../config/prisma";
import bcrypt from "bcrypt";

const methods = {
  async bookList() {
    return new Promise(async (resolve, reject) => {
      try {
        const get_list = await prismaClient.book.findMany({
          select: {
            id: true,
            title: true,
            author: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            isbn: true,
            quantity: true,
            updated_at: true,
          },
        });
        resolve(get_list);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getBookById(book_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get = await prismaClient.book.findUnique({
          where: {
            id: book_id,
          },
          select: {
            id: true,
            title: true,
            author: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            isbn: true,
            quantity: true,
            updated_at: true,
          },
        });
        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getBookByName(book_title: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get = await prismaClient.book.findUnique({
          where: {
            title: book_title,
          },
          select: {
            id: true,
            title: true,
            author: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            isbn: true,
            quantity: true,
            updated_at: true,
          },
        });
        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async createBook(book_data: any, user: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const create = await prismaClient.book.create({
          data: {
            title: book_data.title,
            author: book_data.author,
            category_id: book_data.category_id,
            isbn: book_data.isbn,
            quantity: book_data.quantity,
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
};

export default { ...methods };
