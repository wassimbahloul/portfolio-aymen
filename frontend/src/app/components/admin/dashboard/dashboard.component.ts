import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    research: 0,
    publications: 0,
    talks: 0,
    teaching: 0,
    photos: 0
  };
  
  recentActivity: any[] = [];
  loading = true;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load statistics
    Promise.all([
      this.apiService.getResearch().toPromise(),
      this.apiService.getPublications().toPromise(),
      this.apiService.getTalks().toPromise(),
      this.apiService.getTeaching().toPromise(),
      this.apiService.getPhotosAdmin().toPromise()
    ]).then(([research, publications, talks, teaching, photos]) => {
      this.stats = {
        research: research?.length || 0,
        publications: publications?.length || 0,
        talks: talks?.length || 0,
        teaching: teaching?.length || 0,
        photos: photos?.length || 0
      };
      
      // Generate recent activity (mock data for now)
      this.generateRecentActivity();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    });
  }

  generateRecentActivity(): void {
    // This would typically come from a real activity log
    this.recentActivity = [
      {
        icon: 'add',
        description: 'Nouveau projet de recherche ajouté',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        icon: 'edit',
        description: 'Publication mise à jour',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        icon: 'photo',
        description: 'Nouvelles photos ajoutées à la galerie',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      }
    ];
  }
}

