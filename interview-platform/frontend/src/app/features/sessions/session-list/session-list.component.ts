import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionsService } from '../../../core/services/sessions.service';
import { InterviewSession, SessionStatus } from '../../../core/models/models';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.scss',
})
export class SessionListComponent implements OnInit {
  private sessionsSvc = inject(SessionsService);
  private router = inject(Router);

  displayedColumns = ['title', 'candidate', 'scheduledAt', 'status'];
  sessions = signal<InterviewSession[]>([]);
  loading = signal(true);
  statusFilter: SessionStatus | '' = '';

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.sessionsSvc.list({ status: this.statusFilter }).subscribe({
      next: (res) => {
        this.sessions.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange() {
    this.fetch();
  }

  openRow(session: InterviewSession) {
    this.router.navigate(['/sessions', session.id]);
  }

  statusColor(status: string) {
    if (status === 'COMPLETED') return 'primary';
    if (status === 'CANCELLED') return 'warn';
    return undefined;
  }
}