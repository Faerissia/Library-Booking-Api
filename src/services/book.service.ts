import { prismaClient } from "../config/prisma";
import { BookListModel, BookModel, searchBookModel } from "../model/bookModel";
import { UserJWT } from "../model/authModel";
import responseMethod from "./responseMethod";
import dayjs from "dayjs";

const newDate = dayjs().add(7, "hour").toDate();

const query_book = `SELECT
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
    category c ON c.id = category_id::uuid`;

const methods = {
  async bookList() {
    return new Promise(async (resolve, reject) => {
      try {
        const get_list: BookListModel =
          await prismaClient.$queryRawUnsafe(`${query_book}
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
          `${query_book}
    WHERE b.id = $1::uuid
GROUP BY
    b.id;`,
          book_id
        );
        resolve(get[0]);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async searchBook(
    search_query: searchBookModel,
    page: number,
    page_size: number
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let query_sql = query_book + " WHERE 1=1";
        let count_query = `SELECT COUNT(DISTINCT b.id) as total_count
        FROM book b
        CROSS JOIN LATERAL jsonb_array_elements_text(b.category_ids::jsonb) AS category_id
        JOIN category c ON c.id = category_id::uuid
        WHERE 1=1`;
        let params: any[] = [];
        let paramCounter = 1;

        if (search_query.title) {
          query_sql += ` AND LOWER(b.title) LIKE $${paramCounter}`;
          count_query += ` AND LOWER(b.title) LIKE $${paramCounter}`;
          params.push(`%${search_query.title.toLowerCase()}%`);
          paramCounter++;
        }

        if (search_query.author) {
          query_sql += ` AND LOWER(b.author) LIKE $${paramCounter}`;
          count_query += ` AND LOWER(b.author) LIKE $${paramCounter}`;
          params.push(`%${search_query.author.toLowerCase()}%`);
          paramCounter++;
        }

        if (search_query.category_ids && search_query.category_ids.length > 0) {
          query_sql += ` AND c.id = ANY($${paramCounter}::uuid[])`;
          count_query += ` AND c.id = ANY($${paramCounter}::uuid[])`;
          params.push(search_query.category_ids);
          paramCounter++;
        }

        query_sql += " GROUP BY b.id";

        query_sql += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        params.push(page_size, (page - 1) * page_size);

        const count_result: any = await prismaClient.$queryRawUnsafe(
          count_query,
          ...params.slice(0, -2)
        );
        const total_count = parseInt(count_result[0].total_count);

        const get: BookListModel = await prismaClient.$queryRawUnsafe(
          query_sql,
          ...params
        );

        resolve({
          get,
          pagination: {
            current_page: page,
            total_page: Math.ceil(total_count / page_size),
            page_size: page_size,
            total_count: total_count,
          },
        });
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getBookByName(book_title: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const get: BookListModel = await prismaClient.$queryRawUnsafe(
          `${query_book}
           WHERE b.title = $1
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
            updated_at: newDate,
          },
        });
        resolve(update);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async updateQuantityBook(book_id: string, quantity: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const update = await prismaClient.book.update({
          where: {
            id: book_id,
          },
          data: {
            quantity: {
              increment: quantity,
            },
            updated_at: newDate,
          },
        });
        resolve(update);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async checkBorrowBook(book_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const check_borrow = await prismaClient.borrow_book.findMany({
          where: {
            book_id: book_id,
            return_date: null,
          },
        });
        resolve(check_borrow);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async deleteBookIsRelateBorrow(book_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const delete_book_borrow = await prismaClient.borrow_book.deleteMany({
          where: {
            book_id: book_id,
          },
        });
        resolve(delete_book_borrow);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async deleteBook(book_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const delete_book = await prismaClient.book.delete({
          where: {
            id: book_id,
          },
        });
        resolve(delete_book);
      } catch (err: any) {
        reject(err);
      }
    });
  },
};

export default { ...methods };
