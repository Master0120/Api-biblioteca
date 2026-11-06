export interface Author {
  _id: string;
  name: string;
  nationality: string;
  birthYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorDTO {
  name: string;
  nationality: string;
  birthYear?: number;
}
