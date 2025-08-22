import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  homeData: any = {};
  loading = true;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.loading = true;
    this.apiService.getHome().subscribe({
      next: (data) => {
        this.homeData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading home data:', error);
        this.loading = false;
      }
    });
  }

  getYear(period: string): string {
    if (!period) return '';
    // Extract the year from the period string (e.g., "2020-2023" -> "2020")
    const match = period.match(/\d{4}/);
    return match ? match[0] : period.substring(0, 4);
  }
}

