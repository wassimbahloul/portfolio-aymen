import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {
  photos: any[] = [];
  filteredPhotos: any[] = [];
  loading = true;
  
  selectedCategory = '';
  searchTerm = '';
  
  selectedPhoto: any = null;
  currentPhotoIndex = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadPhotos();
  }

  loadPhotos(): void {
    this.loading = true;
    this.apiService.getPhotos().subscribe({
      next: (data) => {
        this.photos = data.filter((photo: any) => photo.isPublic);
        this.filteredPhotos = this.photos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading photos:', error);
        alert('Erreur lors du chargement des photos: ' + (error.error?.message || error.message));
        this.loading = false;
      }
    });
  }

  filterPhotos(): void {
    this.filteredPhotos = this.photos.filter(photo => {
      const matchesCategory = !this.selectedCategory || photo.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        photo.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (photo.description && photo.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (photo.tags && photo.tags.some((tag: string) => 
          tag.toLowerCase().includes(this.searchTerm.toLowerCase())
        ));
      
      return matchesCategory && matchesSearch;
    });
  }

  openPhotoModal(photo: any, index: number): void {
    this.selectedPhoto = photo;
    this.currentPhotoIndex = this.filteredPhotos.findIndex(p => p._id === photo._id);
  }

  closePhotoModal(): void {
    this.selectedPhoto = null;
    this.currentPhotoIndex = 0;
  }

  previousPhoto(): void {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
      this.selectedPhoto = this.filteredPhotos[this.currentPhotoIndex];
    }
  }

  nextPhoto(): void {
    if (this.currentPhotoIndex < this.filteredPhotos.length - 1) {
      this.currentPhotoIndex++;
      this.selectedPhoto = this.filteredPhotos[this.currentPhotoIndex];
    }
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      conference: 'Conférences',
      research: 'Recherche',
      teaching: 'Enseignement',
      awards: 'Récompenses',
      personal: 'Personnel',
      team: 'Équipe',
      events: 'Événements'
    };
    return labels[category] || category;
  }
}