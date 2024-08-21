export interface BookModel {
  id: string;
  title: string;
  author: string;
  category_ids: JSON;
  isbn: string;
  quantity: number;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
}

export type BookListModel = BookModel[];
