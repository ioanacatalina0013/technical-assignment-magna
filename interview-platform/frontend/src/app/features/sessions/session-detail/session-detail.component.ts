import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionsService } from '../../../core/services/sessions.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { InterviewSession } from '../../../core/models/models';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './session-detail.component.html',
  styleUrl: './session-detail.component.scss',
})
export class SessionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionsSvc = inject(SessionsService);
  private feedbackSvc = inject(FeedbackService);
  private fb = inject(FormBuilder);

  session = signal<InterviewSession | null>(null);
  loading = signal(true);
  savingFeedback = signal(false);

  feedbackForm = this.fb.group({
    strengths: ['', Validators.required],
    improvements: ['', Validators.required],
    recommendation: ['HIRE', Validators.required],
    notes: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fetch(id);
  }

  fetch(id: string) {
    this.loading.set(true);
    this.sessionsSvc.get(id).subscribe({
      next: (s) => {
        this.session.set(s);
        if (s.feedback) {
          this.feedbackForm.patchValue({
            strengths: s.feedback.strengths,
            improvements: s.feedback.improvements,
            recommendation: s.feedback.recommendation,
            notes: s.feedback.notes || '',
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markComplete() {
    const s = this.session();
    if (!s) return;
    this.sessionsSvc.markComplete(s.id).subscribe(() => this.fetch(s.id));
  }

  submitFeedback() {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }
    const s = this.session();
    if (!s) return;
    this.savingFeedback.set(true);
    this.feedbackSvc
      .submit({ sessionId: s.id, ...this.feedbackForm.getRawValue() } as any)
      .subscribe({
        next: () => {
          this.savingFeedback.set(false);
          this.fetch(s.id);
        },
        error: () => this.savingFeedback.set(false),
      });
  }

  statusColor(status: string) {
    if (status === 'COMPLETED') return 'primary';
    if (status === 'CANCELLED') return 'warn';
    return undefined;
  }
}