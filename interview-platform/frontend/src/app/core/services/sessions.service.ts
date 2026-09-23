import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { InterviewSession, PaginatedResponse, SessionStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private base = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  list(opts: { status?: SessionStatus | ''; search?: string; page?: number; pageSize?: number } = {}) {
    const params: Record<string, string | number> = {};
    if (opts.status) params['status'] = opts.status;
    if (opts.search) params['search'] = opts.search;
    params['page'] = opts.page ?? 1;
    params['pageSize'] = opts.pageSize ?? 20;
    return this.http.get<PaginatedResponse<InterviewSession>>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<InterviewSession>(`${this.base}/${id}`);
  }

  create(payload: Partial<InterviewSession>) {
    return this.http.post<InterviewSession>(this.base, payload);
  }

  update(id: string, payload: Partial<InterviewSession>) {
    return this.http.put<InterviewSession>(`${this.base}/${id}`, payload);
  }

  markComplete(id: string) {
    return this.http.patch<InterviewSession>(`${this.base}/${id}/complete`, {});
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}