import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  homeData: any = {};
  loading = true;
  
  // Dynamic counters
  publicationsCount = 0;
  researchCount = 0;
  talksCount = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadHomeData();
    this.loadDynamicCounts();
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

  loadDynamicCounts(): void {
    // Load all counts in parallel
    forkJoin({
      publications: this.apiService.getPublications(),
      research: this.apiService.getResearch(),
      talks: this.apiService.getTalks()
    }).subscribe({
      next: (data) => {
        this.publicationsCount = data.publications?.length || 0;
        this.researchCount = data.research?.length || 0;
        this.talksCount = data.talks?.length || 0;
      },
      error: (error) => {
        console.error('Error loading dynamic counts:', error);
        // Set default values if error
        this.publicationsCount = 0;
        this.researchCount = 0;
        this.talksCount = 0;
      }
    });
  }

  getYear(period: string): string {
    if (!period) return '';
    // Extract the year from the period string (e.g., "2020-2023" -> "2020")
    const match = period.match(/\d{4}/);
    return match ? match[0] : period.substring(0, 4);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // Si l'URL commence par http, c'est déjà une URL complète (Cloudinary)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Sinon, c'est un chemin local, ajouter le serveur
    return 'https://portfolio-aymen.onrender.com' + imagePath;
  }
}

