import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { CandidatesService } from '../../../core/services/candidates.service';
import { Candidate } from '../../../core/models/models';
import { CandidateFormDialogComponent } from '../candidate-form-dialog/candidate-form-dialog.component';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.scss',
})
export class CandidateDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidatesSvc = inject(CandidatesService);
  private dialog = inject(MatDialog);

  candidate = signal<Candidate | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fetch(id);
  }

  fetch(id: string) {
    this.loading.set(true);
    this.candidatesSvc.get(id).subscribe({
      next: (c) => {
        this.candidate.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  editCandidate() {
    const c = this.candidate();
    if (!c) return;
    const ref = this.dialog.open(CandidateFormDialogComponent, { data: { candidate: c } });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.candidatesSvc.update(c.id, result).subscribe(() => this.fetch(c.id));
    });
  }

  deleteCandidate() {
    const c = this.candidate();
    if (!c) return;
    if (!confirm(`Delete ${c.name}? This will also delete their interview sessions.`)) return;
    this.candidatesSvc.delete(c.id).subscribe(() => this.router.navigate(['/candidates']));
  }

  statusColor(status: string) {
    if (status === 'COMPLETED') return 'primary';
    if (status === 'CANCELLED') return 'warn';
    return undefined;
  }
}