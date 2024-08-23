import { BookModel } from "./bookModel";
export interface BorrowModel {
  id?: string;
  user_id: string;
  book_id: string;
  book?: BookModel;
  borrow_date: Date;
  due_date: Date;
  return_date?: Date | null;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
  item_status?: checkIsLateModel;
}

export type BorrowListModel = BorrowModel[];

export interface checkIsLateModel {
  is_late: boolean;
  status: string;
  dayLeft: string;
}
