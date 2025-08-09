import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.apiService.login({ email, password }).subscribe({
        next: (response: any) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.isAuthenticatedSubject.next(true);
            observer.next(response);
            observer.complete();
          } else {
            observer.error('Invalid response');
          }
        },
        error: (error: any) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

