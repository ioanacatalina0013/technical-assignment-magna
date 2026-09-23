import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CandidatesService } from '../../../core/services/candidates.service';
import { Candidate } from '../../../core/models/models';
import { CandidateFormDialogComponent } from '../candidate-form-dialog/candidate-form-dialog.component';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './candidates-list.component.html',
  styleUrl: './candidates-list.component.scss',
})
export class CandidateListComponent implements OnInit {
  private candidatesSvc = inject(CandidatesService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  displayedColumns = ['name', 'email', 'sessions', 'createdAt'];
  candidates = signal<Candidate[]>([]);
  total = signal(0);
  loading = signal(true);
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.pageIndex = 0;
      this.fetch();
    });
    this.fetch();
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  fetch() {
    this.loading.set(true);
    this.candidatesSvc.list(this.searchTerm, this.pageIndex + 1, this.pageSize).subscribe({
      next: (res) => {
        this.candidates.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetch();
  }

  openRow(candidate: Candidate) {
    this.router.navigate(['/candidates', candidate.id]);
  }

  openCreateDialog() {
    const ref = this.dialog.open(CandidateFormDialogComponent, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.candidatesSvc.create(result).subscribe(() => this.fetch());
    });
  }
}