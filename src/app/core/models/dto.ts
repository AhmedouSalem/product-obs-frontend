export interface UserResponse {
  id: number;
  name: string;
  age: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface CategoryRequest {
  id?: number;
  name: string;
  description: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  products?: ProductResponse[];
}

export interface ProductRequest {
  id?: number;
  name: string;
  description: string;
  price: number;
  expiryDate: string;
  categoryId: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  expiryDate: string;
  categoryName: string;
}
