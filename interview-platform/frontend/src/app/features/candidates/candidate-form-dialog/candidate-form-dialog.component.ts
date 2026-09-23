import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Candidate } from '../../../core/models/models';

export interface CandidateDialogData {
  candidate?: Candidate;
}

@Component({
  selector: 'app-candidate-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './candidate-form-dialog.component.html',
  styleUrl: './candidate-form-dialog.component.scss',
})
export class CandidateFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CandidateFormDialogComponent>);
  data = inject<CandidateDialogData>(MAT_DIALOG_DATA);

  isEdit = !!this.data?.candidate;

  form = this.fb.group({
    name: [this.data?.candidate?.name ?? '', [Validators.required]],
    email: [this.data?.candidate?.email ?? ''],
    notes: [this.data?.candidate?.notes ?? ''],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }

  cancel() {
    this.dialogRef.close();
  }
}