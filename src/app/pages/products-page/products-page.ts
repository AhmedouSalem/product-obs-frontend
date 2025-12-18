import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ApiService } from '../../core/api/api';
import { CategoryResponse, ProductRequest, ProductResponse } from '../../core/models/dto';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductCreateDialogComponent } from './product-create-dialog/product-create-dialog';
import { MatSelectModule } from '@angular/material/select';
import { ProductDeleteDialogComponent } from './product-delete-dialog/product-delete-dialog';
import { TraceService } from '../../core/trace/trace.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatDialogModule, MatSnackBarModule, MatSelectModule
  ],
  templateUrl: './products-page.html',
  styleUrls: ['./products-page.css']
})
export class ProductsPageComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'price', 'categoryName', 'expiryDate', 'actions'];

  dataSource = new MatTableDataSource<ProductResponse>([]);
  loading = false;

  // Filter by category
  categoryId: number | null = null;

  // selection + prev/next navigation
  selectedIndex: number = -1;
  selected: ProductResponse | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private trace: TraceService
  ) { }

  categories: CategoryResponse[] = [];
  selectedCategoryId: number | null = null;

  searchValue = '';

  ngOnInit() {
    this.loadCategories();
    this.loadAll();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.setupFilter();

    // tri sur price en numeric
    this.dataSource.sortingDataAccessor = (item, prop) => {
      if (prop === 'price') return item.price ?? 0;
      return (item as any)[prop];
    };
  }

  applySearch(value: string) {
    this.searchValue = value.trim().toLowerCase();
    this.dataSource.filter = this.searchValue;
  }

  private resetSearch() {
    this.searchValue = '';
    this.dataSource.filter = '';
  }


  private setupFilter() {
    this.dataSource.filterPredicate = (data, filter) => {
      const text = `
      ${data.name}
      ${data.categoryName}
      ${data.price}
    `.toLowerCase();

      return text.includes(filter);
    };
  }

  private loadCategories() {
    this.trace.runObservable(
      'ProductComponent.loadCategories',
      () => this.api.getCategories()
    ).subscribe({
      next: (cats) => {
        this.categories = cats;

        // pré-sélection automatique
        if (!this.selectedCategoryId && cats.length) {
          this.selectedCategoryId = cats[0].id;
        }
      },
      error: () => {
        this.snack.open('Failed to load categories', 'OK', { duration: 2500 });
      }
    });
  }


  // -------- Actions --------

  loadAll() {
    this.resetSearch();
    this.fetch('ProductComponent.loadProducts', () => this.api.getProducts(), 'Loaded all products');
  }

  mostExpensive() {
    this.resetSearch();
    this.fetch('ProductComponent.mostExpensive', () => this.api.mostExpensive(), 'Loaded most expensive products');
  }


  filterByCategory() {
    this.resetSearch();

    if (!this.selectedCategoryId) {
      this.snack.open('Select a category first', 'OK', { duration: 2000 });
      return;
    }

    this.fetch(
      'ProductComponent.filterByCategory',
      () => this.api.byCategory(this.selectedCategoryId!),
      `Filtered by category ${this.selectedCategoryId}`,
      { 'category.id': this.selectedCategoryId }
    );
  }


  onCategoryChange() {
    if (this.selectedCategoryId === null) {
      this.loadAll();
      return;
    }

    this.filterByCategory();
  }

  mostExpensiveByCategory() {
    this.resetSearch();
    if (!this.selectedCategoryId) {
      this.snack.open('Select a category first', 'OK', { duration: 2000 });
      return;
    }
    this.fetch(
      'ProductComponent.mostExpensiveByCategory',
      () => this.api.mostExpensiveByCategory(this.selectedCategoryId!),
      `Most expensive by category ${this.selectedCategoryId}`
    );
  }

  openCreateDialog() {
    const ref = this.dialog.open(ProductCreateDialogComponent, {
      data: {
        mode: 'create',
        categories: this.categories,
        categoryIdHint: this.selectedCategoryId ?? undefined
      }
    });

    ref.afterClosed().subscribe((payload: ProductRequest | null) => {
      if (!payload) return;

      this.loading = true;

      this.trace.runObservable(
        'ProductComponent.createProduct',
        () => this.api.createProduct(payload),
        {
          'product.name': payload.name,
          'category.id': payload.categoryId,
          'product.price': payload.price
        }
      ).subscribe({
        next: () => {
          this.snack.open('Product created', 'OK', { duration: 1500 });
          this.reloadAccordingToCurrentFilter();
        },
        error: (err) => {
          this.loading = false;
          this.snack.open(err?.error?.message ?? 'Failed to create product', 'OK', { duration: 3000 });
        }
      });
    });
  }



  // -------- Table selection + navigation --------

  selectRow(row: ProductResponse) {
    const data = this.dataSource.filteredData.length ? this.dataSource.filteredData : this.dataSource.data;
    const idx = data.findIndex(p => p.id === row.id);

    this.selectedIndex = idx;
    this.selected = idx >= 0 ? data[idx] : null;
  }

  previous() {
    const data = this.dataSource.filteredData.length ? this.dataSource.filteredData : this.dataSource.data;
    if (!data.length) return;

    if (this.selectedIndex <= 0) this.selectedIndex = 0;
    else this.selectedIndex--;

    this.selected = data[this.selectedIndex];
    this.ensureSelectedVisible();
  }

  next() {
    const data = this.dataSource.filteredData.length ? this.dataSource.filteredData : this.dataSource.data;
    if (!data.length) return;

    if (this.selectedIndex < 0) this.selectedIndex = 0;
    else if (this.selectedIndex >= data.length - 1) this.selectedIndex = data.length - 1;
    else this.selectedIndex++;

    this.selected = data[this.selectedIndex];
    this.ensureSelectedVisible();
  }

  clearSelection() {
    this.selectedIndex = -1;
    this.selected = null;
  }

  private ensureSelectedVisible() {
    // si paginator activé, on place la page contenant l'index
    if (!this.paginator) return;
    const size = this.paginator.pageSize || 10;
    const targetPage = Math.floor(this.selectedIndex / size);
    if (this.paginator.pageIndex !== targetPage) {
      this.paginator.pageIndex = targetPage;
      this.paginator._changePageSize(this.paginator.pageSize); // refresh
    }
  }

  openEditDialog(row: ProductResponse) {
    const ref = this.dialog.open(ProductCreateDialogComponent, {
      data: {
        mode: 'edit',
        categories: this.categories,
        categoryIdHint: this.selectedCategoryId ?? undefined,
        product: row
      }
    });

    ref.afterClosed().subscribe((payload: ProductRequest | null) => {
      if (!payload) return;

      this.loading = true;

      this.trace.runObservable(
        'ProductComponent.updateProduct',
        () => this.api.updateProduct(row.id, payload),
        {
          'product.id': row.id,
          'product.name': payload.name,
          'product.price': payload.price,
          'category.id': payload.categoryId
        }
      ).subscribe({
        next: () => {
          this.snack.open('Product updated', 'OK', { duration: 1500 });
          this.reloadAccordingToCurrentFilter();
        },
        error: (err) => {
          this.loading = false;
          this.snack.open(err?.error?.message ?? 'Failed to update product', 'OK', { duration: 3000 });
        }
      });

    });
  }

  openDeleteDialog(row: ProductResponse) {
    const ref = this.dialog.open(ProductDeleteDialogComponent, {
      data: { name: row.name }
    });

    ref.afterClosed().subscribe((confirm: boolean) => {
      if (!confirm) return;

      this.loading = true;

      this.trace.runObservable(
        'ProductComponent.deleteProduct',
        () => this.api.deleteProduct(row.id),
        {
          'product.id': row.id,
          'product.name': row.name
        }
      ).subscribe({
        next: () => {
          this.snack.open('Product deleted', 'OK', { duration: 1500 });
          this.reloadAccordingToCurrentFilter();
        },
        error: (err) => {
          this.loading = false;
          this.snack.open(err?.error?.message ?? 'Failed to delete product', 'OK', { duration: 3000 });
        }
      });

    });
  }

  private reloadAccordingToCurrentFilter() {
    // si "All"
    if (this.selectedCategoryId === null) {
      this.loadAll();
      return;
    }
    // si une catégorie sélectionnée → on re-filtre
    if (this.selectedCategoryId) {
      this.filterByCategory();
      return;
    }
    // fallback
    this.loadAll();
  }


  // -------- Helpers --------
  private fetch(
    spanName: string,
    obsFactory: () => import('rxjs').Observable<ProductResponse[]>,
    okMsg: string,
    attrs?: Record<string, any>
  ) {
    this.loading = true;
    this.clearSelection();

    this.trace.runObservable<ProductResponse[]>(spanName, obsFactory, attrs).subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.loading = false;
        this.snack.open(okMsg, 'OK', { duration: 1500 });
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Request failed';
        this.snack.open(msg, 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }


  formatDate(value: string) {
    // value: ISO or string; on affiche simple
    return value ? value.toString().slice(0, 10) : '';
  }

  isSelected(row: ProductResponse) {
    return this.selected?.id === row.id;
  }
}
