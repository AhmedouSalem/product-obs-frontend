import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { LoginPageComponent } from './pages/login-page/login-page';
import { AppShellComponent } from './layout/app-shell/app-shell';
import { ProductsPageComponent } from './pages/products-page/products-page';
import { CategoriesPageComponent } from './pages/categories-page/categories-page';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      { path: 'products', component: ProductsPageComponent },
      { path: 'categories', component: CategoriesPageComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
