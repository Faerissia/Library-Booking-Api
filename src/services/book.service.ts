import { prismaClient } from "../config/prisma";
import bcrypt from "bcrypt";
import { BookListModel, BookModel } from "../model/bookModel";
import { UserJWT } from "../model/authModel";
import responseMethod from "./responseMethod";

const methods = {
  async bookList() {
    return new Promise(async (resolve, reject) => {
      try {
        const get_list: BookListModel =
          await prismaClient.$queryRawUnsafe(`SELECT
    b.id,
    b.title,
    b.author,
    json_agg(json_build_object('id', c.id, 'name', c.name)) AS categories,
    b.isbn,
    b.quantity,
    b.updated_at
FROM
    book b
CROSS JOIN LATERAL jsonb_array_elements_text(b.category_ids::jsonb) AS category_id
JOIN
    category c ON c.id = category_id::uuid
GROUP BY
    b.id;`);
        resolve(get_list);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getBookById(book_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get: BookListModel = await prismaClient.$queryRawUnsafe(
          `SELECT
    b.id,
    b.title,
    b.author,
    json_agg(json_build_object('id', c.id, 'name', c.name)) AS categories,
    b.isbn,
    b.quantity,
    b.updated_at
FROM
    book b
CROSS JOIN LATERAL jsonb_array_elements_text(b.category_ids::jsonb) AS category_id
JOIN
    category c ON c.id = category_id::uuid WHERE b.id = $1
GROUP BY
    b.id;`,
          book_id
        );
        resolve(get[0]);
      } catch (err: any) {
        if (err.code === "P2010") {
          return reject(responseMethod.InvalidRequest("book_id invalid"));
        }
        reject(err);
      }
    });
  },
  async getBookByName(book_title: string) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(book_title);
        const get: BookListModel = await prismaClient.$queryRawUnsafe(
          `SELECT
          b.id,
          b.title,
          b.author,
          json_agg(json_build_object('id', c.id, 'name', c.name)) AS categories,
          b.isbn,
          b.quantity,
          b.updated_at
      FROM
          book b
      CROSS JOIN LATERAL jsonb_array_elements_text(b.category_ids::jsonb) AS category_id
      JOIN
          category c ON c.id = category_id::uuid WHERE b.title = $1
      GROUP BY
          b.id;`,
          book_title
        );
        resolve(get[0]);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async createBook(book_data: BookModel, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const create = await prismaClient.book.create({
          data: {
            title: book_data.title,
            author: book_data.author,
            category_ids: book_data.category_ids,
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
  async updateBook(book_data: BookModel, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const update = await prismaClient.book.update({
          where: {
            id: book_data.id,
          },
          data: {
            title: book_data.title,
            author: book_data.author,
            category_ids: book_data.category_ids,
            isbn: book_data.isbn,
            quantity: book_data.quantity,
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
