import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css'],
  encapsulation: ViewEncapsulation.None
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
    
    // Load structured CV data first
    this.apiService.getPublicCvData().subscribe({
      next: (structuredData) => {
        console.log('📋 CV Data loaded from API:', structuredData);
        
        if (structuredData) {
          this.cvData = { ...this.cvData, ...structuredData };
          console.log('✅ CV Data set:', this.cvData);
          
          if (structuredData.pdfUrl) {
            const fullUrl = `https://portfolio-aymen.onrender.com${structuredData.pdfUrl}`;
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
            console.log('📄 PDF URL set:', fullUrl);
          }
        }
        
        // Always try to load old CV file as fallback for PDF
        this.loadOldCVData();
      },
      error: (error) => {
        console.error('❌ Error loading structured CV data:', error);
        // Fallback to old CV file
        this.loadOldCVData();
      }
    });
  }

  loadOldCVData(): void {
    this.apiService.getCV().subscribe({
      next: (data) => {
        console.log('📎 Old CV Data loaded:', data);
        
        if (data && data.cvFile) {
          this.cvData = { ...this.cvData, cvFile: data.cvFile };
          
          // Only set PDF URL if we don't already have one from structured data
          if (!this.pdfUrl) {
            const fullUrl = `https://portfolio-aymen.onrender.com${data.cvFile}`;
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
            console.log('📄 Fallback PDF URL set:', fullUrl);
          }
        }
        
        console.log('🎯 Final CV Data:', this.cvData);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading old CV data:', error);
        this.loading = false;
      }
    });
  }

  openInNewTab(): void {
    if (this.cvData.pdfUrl || this.cvData.cvFile) {
      const url = this.cvData.pdfUrl || this.cvData.cvFile;
      const fullUrl = `https://portfolio-aymen.onrender.com${url}`;
      
      console.log('🔍 Tentative d\'ouverture du PDF:', fullUrl);
      console.log('📄 Données CV:', this.cvData);
      
      // Pour Render, on peut essayer d'ouvrir directement d'abord
      console.log('🚀 Ouverture directe du PDF (Render)...');
      window.open(fullUrl, '_blank');
      
      // Vérification en arrière-plan pour information
      fetch(fullUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log('✅ Fichier PDF vérifié et accessible:', fullUrl);
          } else {
            console.error('❌ Fichier PDF non trouvé (status:', response.status, ')');
            // Ne pas afficher d'alerte car on a déjà ouvert l'onglet
          }
        })
        .catch(error => {
          console.error('🚨 Erreur lors de la vérification du PDF:', error);
        });
    } else {
      console.warn('⚠️ Aucun fichier PDF configuré');
      alert('Aucun fichier PDF n\'est configuré. L\'administrateur doit télécharger un fichier CV.');
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      
      if (remainingMonths === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else {
        return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
    }
  }
}
