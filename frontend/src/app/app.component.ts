import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'portfolio-app';
  isMenuOpen = false;
  currentRoute = '';
  logoSrc = 'assets/images/aymen(1).png';
  showDefaultLogo = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Track route changes
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      this.isMenuOpen = false; // Close mobile menu on route change
    });
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
  }

  onImageError(): void {
    this.showDefaultLogo = true;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isAdminRoute(): boolean {
    return this.currentRoute.startsWith('/admin');
  }

  isLoginRoute(): boolean {
    return this.currentRoute === '/admin/login';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}

