import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

type DialogData = { name: string };

@Component({
  selector: 'app-product-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './product-delete-dialog.html'
})
export class ProductDeleteDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ProductDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  cancel() { this.dialogRef.close(false); }
  confirm() { this.dialogRef.close(true); }
}
