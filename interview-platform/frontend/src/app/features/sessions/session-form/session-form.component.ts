import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SessionsService } from '../../../core/services/sessions.service';
import { CandidatesService } from '../../../core/services/candidates.service';
import { Candidate } from '../../../core/models/models';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './session-form.component.html',
  styleUrl: './session-form.component.scss',
})
export class SessionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sessionsSvc = inject(SessionsService);
  private candidatesSvc = inject(CandidatesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = false;
  sessionId: string | null = null;
  candidates = signal<Candidate[]>([]);
  loading = signal(false);

  form = this.fb.group({
    candidateId: ['', Validators.required],
    title: ['', Validators.required],
    role: [''],
    level: [''],
    scheduledAt: ['', Validators.required],
    durationMins: [60],
  });

  ngOnInit() {
    this.candidatesSvc.list('', 1, 100).subscribe((res) => this.candidates.set(res.items));

    this.sessionId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.sessionId;

    if (this.isEdit && this.sessionId) {
      this.sessionsSvc.get(this.sessionId).subscribe((s) => {
        this.form.patchValue({
          candidateId: s.candidateId,
          title: s.title,
          role: s.role || '',
          level: s.level || '',
          scheduledAt: this.toLocalDatetime(s.scheduledAt),
          durationMins: s.durationMins || 60,
        });
      });
    }
  }

  private toLocalDatetime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      scheduledAt: new Date(raw.scheduledAt!).toISOString(),
      durationMins: raw.durationMins ? Number(raw.durationMins) : undefined,
    } as any; // form controls type as string | null; API payload shape is looser than the entity type

    const req$ = this.isEdit && this.sessionId
      ? this.sessionsSvc.update(this.sessionId, payload)
      : this.sessionsSvc.create(payload);

    req$.subscribe({
      next: (s) => this.router.navigate(['/sessions', s.id]),
      error: () => this.loading.set(false),
    });
  }
}