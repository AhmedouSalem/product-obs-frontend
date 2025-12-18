import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CategoryRequest, CategoryResponse,
  ProductRequest, ProductResponse,
  UserResponse
} from '../models/dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // Users
  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.base}/api/users/me`);
  }

  // Categories
  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.base}/api/categories`);
  }

  createCategory(body: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${this.base}/api/categories`, body);
  }

  // Products
  getProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.base}/api/products`);
  }

  createProduct(body: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.base}/api/products`, body);
  }

  mostExpensive(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.base}/api/products/most-expensive`);
  }

  byCategory(categoryId: number): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.base}/api/products/by-category/${categoryId}`);
  }

  mostExpensiveByCategory(categoryId: number): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.base}/api/products/by-category/${categoryId}/most-expensive`);
  }

  updateCategory(id: number, body: CategoryRequest) {
    return this.http.put<CategoryResponse>(`${this.base}/api/categories/${id}`, body);
  }

  deleteCategory(id: number) {
    return this.http.delete<void>(`${this.base}/api/categories/${id}`);
  }

  updateProduct(id: number, body: ProductRequest) {
    return this.http.put<ProductResponse>(`${this.base}/api/products/${id}`, body);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${this.base}/api/products/${id}`);
  }

}
