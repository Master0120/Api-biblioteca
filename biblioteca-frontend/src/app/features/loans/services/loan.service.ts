import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Loan, LoanDTO } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/loans`;

  getAll(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.url);
  }

  getById(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.url}/${id}`);
  }

  create(data: LoanDTO): Observable<Loan> {
    return this.http.post<Loan>(this.url, data);
  }

  update(id: string, data: Partial<LoanDTO>): Observable<Loan> {
    return this.http.put<Loan>(`${this.url}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
