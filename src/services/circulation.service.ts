import { prismaClient } from "../config/prisma";
import { UserJWT } from "../model/authModel";
import { BorrowModel } from "../model/circulationModel";
import responseMethod from "./responseMethod";
import dayjs from "dayjs";

const newDate = dayjs().add(7, "hour").toDate();

const methods = {
  async getBorrowList(
    page: number,
    page_size: number,
    user: UserJWT,
    query?: "overdue" | "borrow" | null
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let find: any;
        let total_count: any;

        const base_select = {
          id: true,
          book: true,
          borrow_date: true,
          due_date: true,
          return_date: true,
        };

        if (user.role === "admin") {
          total_count = await prismaClient.borrow_book.count();
          find = await prismaClient.borrow_book.findMany({
            select: {
              ...base_select,
              user: true,
              created_at: true,
              created_by: true,
              updated_at: true,
              updated_by: true,
            },
            skip: (page - 1) * page_size,
            take: page_size,
          });
        } else if (user.role === "user") {
          total_count = await prismaClient.borrow_book.count({
            where: {
              user_id: user.user_id,
            },
          });
          find = await prismaClient.borrow_book.findMany({
            where: {
              user_id: user.user_id,
            },
            select: base_select,
            skip: (page - 1) * page_size,
            take: page_size,
          });
        }

        const process_result = await Promise.all(
          find?.map(async (item: BorrowModel) => {
            const item_status = await this.checkIsLate(
              item.return_date as Date,
              item.due_date
            );
            return { ...item, item_status };
          })
        );

        let filter_result = process_result;
        if (query === "overdue") {
          filter_result = process_result.filter(
            (item: BorrowModel) => item.item_status?.status === "Overdue"
          );
        } else if (query === "borrow") {
          filter_result = process_result.filter(
            (item: BorrowModel) => item.item_status?.status === "Borrowed"
          );
        }

        resolve({
          filter_result,
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
  async getBorrowById(borrow_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const find = await prismaClient.borrow_book.findUnique({
          where: {
            id: borrow_id,
          },
          select: {
            book_id: true,
            book: true,
            return_date: true,
          },
        });
        resolve(find);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async findBorrow(book_id: string, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const find = await prismaClient.borrow_book.findFirst({
          orderBy: {
            created_at: "desc",
          },
          where: {
            book_id: book_id,
            user_id: user.user_id,
          },
        });
        resolve(find);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async borrow(book_id: string, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const dueDate = dayjs().add(7, "hour").add(7, "day").toDate();
        const create_borrow = await prismaClient.borrow_book.create({
          data: {
            user_id: user.user_id,
            book_id: book_id,
            borrow_date: newDate,
            due_date: dueDate,
            created_by: user.user_id,
            created_at: newDate,
            updated_by: user.user_id,
            updated_at: newDate,
          },
          select: {
            borrow_date: true,
            due_date: true,
          },
        });

        resolve(create_borrow);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async returnBook(book_id: string, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const update_return = await prismaClient.borrow_book.update({
          where: {
            id: book_id,
          },
          data: {
            return_date: newDate,
            updated_at: newDate,
            updated_by: user.user_id,
          },
          select: {
            borrow_date: true,
            due_date: true,
            return_date: true,
          },
        });

        resolve(update_return);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async checkIsLate(return_date: Date, due_date: Date) {
    return new Promise(async (resolve, reject) => {
      try {
        const isLate = return_date
          ? dayjs(return_date).isAfter(dayjs(due_date))
          : dayjs().isAfter(dayjs(due_date));

        const status = return_date
          ? isLate
            ? "Returned Late"
            : "Returned On Time"
          : isLate
          ? "Overdue"
          : "Borrowed";

        const day_left = dayjs(due_date).diff(newDate, "day");
        const day_over_due = dayjs().diff(dayjs(return_date), "day");

        let dayLeft: string;

        if (day_left > 0) {
          dayLeft = `${day_left} day(s) left until due date`;
        } else if (day_over_due > 0) {
          dayLeft = `${day_over_due} day(s) overdue`;
        } else {
          dayLeft = "Due today";
        }

        resolve({ isLate, status, dayLeft });
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async getMostBorrowBook() {
    return new Promise(async (resolve, reject) => {
      try {
        const get = await prismaClient.book.findMany({
          select: {
            id: true,
            title: true,
            author: true,
            _count: {
              select: { borrow_book: true },
            },
          },
          orderBy: {
            borrow_book: {
              _count: "desc",
            },
          },
        });

        resolve(get);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async editBorrow(borrow_data: Partial<BorrowModel>, user: UserJWT) {
    return new Promise(async (resolve, reject) => {
      try {
        const update_data: any = {
          updated_by: user.user_id,
          updated_at: newDate,
        };

        if (borrow_data.user_id !== undefined)
          update_data.user_id = borrow_data.user_id;
        if (borrow_data.book_id !== undefined)
          update_data.book_id = borrow_data.book_id;
        if (borrow_data.borrow_date !== undefined)
          update_data.borrow_date = dayjs(borrow_data.borrow_date);
        if (borrow_data.due_date !== undefined)
          update_data.due_date = dayjs(borrow_data.due_date);
        if (borrow_data.return_date !== undefined)
          update_data.return_date = dayjs(borrow_data.return_date);

        const update = await prismaClient.borrow_book.update({
          where: {
            id: borrow_data.id,
          },
          data: update_data,
        });
        resolve(update);
      } catch (err: any) {
        reject(err);
      }
    });
  },
  async deleteBorrow(borrow_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const delete_borrow = await prismaClient.borrow_book.delete({
          where: {
            id: borrow_id,
          },
        });
        resolve(delete_borrow);
      } catch (err: any) {
        reject(err);
      }
    });
  },
};

export default { ...methods };
