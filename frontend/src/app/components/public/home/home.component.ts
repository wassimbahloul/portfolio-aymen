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
}

