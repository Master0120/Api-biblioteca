import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Book, BookDTO } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/books`;

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.url);
  }

  getById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.url}/${id}`);
  }

  create(data: BookDTO): Observable<Book> {
    return this.http.post<Book>(this.url, data);
  }

  update(id: string, data: Partial<BookDTO>): Observable<Book> {
    return this.http.put<Book>(`${this.url}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
