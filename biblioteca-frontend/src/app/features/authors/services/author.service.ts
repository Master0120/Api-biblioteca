import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Author, AuthorDTO } from '../models/author.model';

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/authors`;

  getAll(): Observable<Author[]> {
    return this.http.get<Author[]>(this.url);
  }

  getById(id: string): Observable<Author> {
    return this.http.get<Author>(`${this.url}/${id}`);
  }

  create(data: AuthorDTO): Observable<Author> {
    return this.http.post<Author>(this.url, data);
  }

  update(id: string, data: Partial<AuthorDTO>): Observable<Author> {
    return this.http.put<Author>(`${this.url}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
