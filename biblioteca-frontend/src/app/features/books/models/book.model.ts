export interface Book {
  _id: string;
  title: string;
  isbn: string;
  authorId: string;
  year?: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookDTO {
  title: string;
  isbn: string;
  authorId: string;
  year?: number;
}
