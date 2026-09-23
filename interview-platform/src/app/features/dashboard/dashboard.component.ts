import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ReportsService } from '../../core/services/reports.service';
import { ReportSummary, TrendPoint } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private reports = inject(ReportsService);

  loading = signal(true);
  summary = signal<ReportSummary | null>(null);
  trend = signal<TrendPoint[]>([]);

  ngOnInit() {
    this.reports.summary().subscribe((s) => this.summary.set(s));
    this.reports.trend(8).subscribe((t) => {
      this.trend.set(t.trend);
      this.loading.set(false);
    });
  }

  maxTrendCount() {
    return Math.max(1, ...this.trend().map((t) => t.count));
  }

  recommendationLabel(rec: string) {
    return rec.replace('_', ' ').toLowerCase();
  }
}