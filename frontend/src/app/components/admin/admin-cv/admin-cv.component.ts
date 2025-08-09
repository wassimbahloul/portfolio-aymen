import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-cv',
  templateUrl: './admin-cv.component.html',
  styleUrls: ['./admin-cv.component.css']
})
export class AdminCvComponent implements OnInit {
  selectedFile: File | null = null;
  loading = false;
  saving = false;
  showSuccessMessage = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert('Veuillez sélectionner un fichier PDF valide.');
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  uploadCV(): void {
    if (!this.selectedFile) {
      alert('Aucun fichier sélectionné.');
      return;
    }

    this.saving = true;
    this.apiService.uploadCVFile(this.selectedFile).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccessMessage = true;
        this.selectedFile = null;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error uploading CV:', error);
        this.saving = false;
        alert('Erreur lors du téléchargement du CV.');
      }
    });
  }
}