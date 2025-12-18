import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CategoryRequest, CategoryResponse } from '../../../core/models/dto';

type DialogData = {
  mode: 'create' | 'edit';
  category?: CategoryResponse;
};

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule
  ],
  templateUrl: './category-dialog.html',
  styleUrls: ['./category-dialog.css']
})
export class CategoryDialogComponent {
  title: string;
  form: CategoryRequest;

  constructor(
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.title = this.data.mode === 'create' ? 'Create Category' : 'Edit Category';
    this.form = {
      name: this.data.category?.name ?? '',
      description: this.data.category?.description ?? ''
    };
  }

  cancel() {
    this.dialogRef.close(null);
  }

  submit() {
    this.dialogRef.close(this.form);
  }
}
