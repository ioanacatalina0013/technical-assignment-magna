import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Candidate, PaginatedResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private base = `${environment.apiUrl}/candidates`;

  constructor(private http: HttpClient) {}

  list(search = '', page = 1, pageSize = 20) {
    return this.http.get<PaginatedResponse<Candidate>>(this.base, {
      params: { search, page, pageSize },
    });
  }

  get(id: string) {
    return this.http.get<Candidate>(`${this.base}/${id}`);
  }

  create(payload: Partial<Candidate>) {
    return this.http.post<Candidate>(this.base, payload);
  }

  update(id: string, payload: Partial<Candidate>) {
    return this.http.put<Candidate>(`${this.base}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}