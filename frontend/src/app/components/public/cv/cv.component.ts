import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css']
})
export class CvComponent implements OnInit {
  cvData: any = {};
  loading = true;
  pdfUrl: SafeResourceUrl | null = null;

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadCVData();
  }

  loadCVData(): void {
    this.loading = true;
    this.apiService.getCV().subscribe({
      next: (data) => {
        this.cvData = data;
        if (this.cvData.cvFile) {
          const fullUrl = `http://localhost:5000${this.cvData.cvFile}`;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading CV data:', error);
        this.loading = false;
      }
    });
  }

  downloadCV(): void {
    if (this.cvData.cvFile) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${this.cvData.cvFile}`;
      link.download = 'CV.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openInNewTab(): void {
    if (this.cvData.cvFile) {
      window.open(`http://localhost:5000${this.cvData.cvFile}`, '_blank');
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}