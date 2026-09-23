import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ReportSummary, TrendPoint } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private base = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  summary() {
    return this.http.get<ReportSummary>(`${this.base}/summary`);
  }

  trend(weeks = 8) {
    return this.http.get<{ trend: TrendPoint[] }>(`${this.base}/trend`, {
      params: { weeks },
    });
  }
}