import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { CategoryResponse, ProductRequest, ProductResponse } from '../../../core/models/dto';

type DialogData = {
  mode: 'create' | 'edit';
  categories: CategoryResponse[];
  categoryIdHint?: number;
  product?: ProductResponse;
};

@Component({
  selector: 'app-product-create-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule,
    MatSelectModule
  ],
  templateUrl: './product-create-dialog.html',
  styleUrls: ['./product-create-dialog.css']
})
export class ProductCreateDialogComponent {
  title!: string;
  submitLabel!: string;

  categories: CategoryResponse[] = [];

  form: ProductRequest = {
    name: '',
    description: '',
    price: 1,
    expiryDate: '',
    categoryId: 1
  };

  constructor(
    private dialogRef: MatDialogRef<ProductCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.title = this.data.mode === 'create' ? 'Create Product' : 'Edit Product';
    this.submitLabel = this.data.mode === 'create' ? 'Create' : 'Save';

    this.categories = data.categories ?? [];

    if (data.mode === 'edit' && data.product) {
      // on pré-remplit
      this.form = {
        id: data.product.id,
        name: data.product.name,
        description: data.product.description,
        price: data.product.price,
        expiryDate: (data.product.expiryDate ?? '').toString().slice(0, 10),
        // on ne connaît pas categoryId depuis ProductResponse -> on met hint ou 1
        categoryId: data.categoryIdHint ?? (this.categories[0]?.id ?? 1)
      };
    } else {
      // create
      this.form.categoryId = data.categoryIdHint ?? (this.categories[0]?.id ?? 1);
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }

  submit() {
    this.dialogRef.close(this.form);
  }
}
