import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TraceService } from '../../core/trace/trace.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPageComponent {
  login = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router,
    private trace: TraceService,) { }

  submit() {
    this.error = '';
    this.loading = true;
    this.trace.runObservable(
      'ui.login',
      () => this.auth.login({ login: this.login, password: this.password }),
      { 'auth.login': this.login }
    ).subscribe({
      next: () => this.router.navigateByUrl('/products'),
      error: (err) => {
        this.error = err?.error?.message ?? 'Login failed';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
