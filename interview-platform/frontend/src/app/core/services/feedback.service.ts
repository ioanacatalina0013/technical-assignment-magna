import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Feedback } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private base = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  submit(payload: Partial<Feedback>) {
    return this.http.post<Feedback>(this.base, payload);
  }

  get(id: string) {
    return this.http.get<Feedback>(`${this.base}/${id}`);
  }
}