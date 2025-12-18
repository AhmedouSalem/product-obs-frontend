import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ApiService } from '../../core/api/api';
import { CategoryRequest, CategoryResponse } from '../../core/models/dto';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CategoryDialogComponent } from './category-dialog/category-dialog';
import { CategoryDeleteDialogComponent } from './category-delete-dialog/category-delete-dialog';
import { TraceService } from '../../core/trace/trace.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './categories-page.html',
  styleUrls: ['./categories-page.css']
})
export class CategoriesPageComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
  dataSource = new MatTableDataSource<CategoryResponse>([]);
  loading = false;

  selectedIndex = -1;
  selected: CategoryResponse | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private trace: TraceService
  ) { }

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load() {
    this.loading = true;
    this.clearSelection();

    this.trace.runObservable(
      'CategoryComponent.loadCategories',
      () => this.api.getCategories()
    ).subscribe({
      next: (cats) => {
        this.dataSource.data = cats;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(err?.error?.message ?? 'Failed to load categories', 'OK', { duration: 3000 });
      }
    });
  }


  // Selection + navigation
  selectRow(row: CategoryResponse) {
    const data = this.dataSource.data;
    const idx = data.findIndex(c => c.id === row.id);
    this.selectedIndex = idx;
    this.selected = idx >= 0 ? data[idx] : null;
  }

  previous() {
    const data = this.dataSource.data;
    if (!data.length) return;
    this.selectedIndex = Math.max(0, this.selectedIndex <= 0 ? 0 : this.selectedIndex - 1);
    this.selected = data[this.selectedIndex];
    this.ensureSelectedVisible();
  }

  next() {
    const data = this.dataSource.data;
    if (!data.length) return;
    if (this.selectedIndex < 0) this.selectedIndex = 0;
    else this.selectedIndex = Math.min(data.length - 1, this.selectedIndex + 1);
    this.selected = data[this.selectedIndex];
    this.ensureSelectedVisible();
  }

  clearSelection() {
    this.selectedIndex = -1;
    this.selected = null;
  }

  private ensureSelectedVisible() {
    if (!this.paginator) return;
    const size = this.paginator.pageSize || 10;
    const targetPage = Math.floor(this.selectedIndex / size);
    if (this.paginator.pageIndex !== targetPage) {
      this.paginator.pageIndex = targetPage;
      this.paginator._changePageSize(this.paginator.pageSize);
    }
  }

  isSelected(row: CategoryResponse) {
    return this.selected?.id === row.id;
  }

  // CRUD
  openCreate() {
    const ref = this.dialog.open(CategoryDialogComponent, {
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((payload: CategoryRequest | null) => {
      if (!payload) return;
      this.loading = true;

      this.trace.runObservable(
        'CategoryComponent.createCategory',
        () => this.api.createCategory(payload),
        {
          'category.name': payload.name
        }
      ).subscribe({
        next: () => {
          this.snack.open('Category created', 'OK', { duration: 1500 });
          this.load();
        },
        error: (err) => {
          this.loading = false;
          this.snack.open(err?.error?.message ?? 'Failed to create category', 'OK', { duration: 3000 });
        }
      });

    });
  }

  openEdit(row: CategoryResponse) {
    const ref = this.dialog.open(CategoryDialogComponent, {
      data: { mode: 'edit', category: row }
    });

    ref.afterClosed().subscribe((payload: CategoryRequest | null) => {
      if (!payload) return;
      this.loading = true;

      this.trace.runObservable(
        'CategoryComponent.updateCategory',
        () => this.api.updateCategory(row.id, payload),
        {
          'category.id': row.id,
          'category.name': payload.name
        }
      ).subscribe({
        next: () => {
          this.snack.open('Category updated', 'OK', { duration: 1500 });
          this.load();
        },
        error: (err) => {
          this.loading = false;
          this.snack.open(err?.error?.message ?? 'Failed to update category', 'OK', { duration: 3000 });
        }
      });

    });
  }

  openDelete(row: CategoryResponse) {
    const ref = this.dialog.open(CategoryDeleteDialogComponent, {
      data: { name: row.name }
    });

    ref.afterClosed().subscribe((confirm: boolean) => {
      if (!confirm) return;
      this.loading = true;

      this.trace.runObservable(
        'CategoryComponent.deleteCategory',
        () => this.api.deleteCategory(row.id),
        {
          'category.id': row.id,
          'category.name': row.name
        }
      ).subscribe({
        next: () => {
          this.snack.open('Category deleted', 'OK', { duration: 1500 });
          this.load();
        },
        error: (err) => {
          this.loading = false;
          this.snack.open(err?.error?.message ?? 'Failed to delete category', 'OK', { duration: 3000 });
        }
      });

    });
  }
}
