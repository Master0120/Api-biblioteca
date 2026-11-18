//son interfaces TypeScript, no clases. 
// Book representa un libro recibido de la API;
//  BookDTO, los datos enviados

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
