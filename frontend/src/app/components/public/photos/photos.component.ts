import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit, OnDestroy {
  photos: any[] = [];
  filteredPhotos: any[] = [];
  photosByLocation: any[] = [];
  loading = true;
  
  selectedCategory = '';
  searchTerm = '';
  
  selectedPhoto: any = null;
  currentPhotoIndex = 0;
  
  private autoCarouselIntervals: { [key: string]: any } = {};

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadPhotos();
  }

  ngOnDestroy(): void {
    // Clean up auto-carousel intervals
    Object.values(this.autoCarouselIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
  }

  loadPhotos(): void {
    this.loading = true;
    this.apiService.getPhotos().subscribe({
      next: (data) => {
        this.photos = data.filter((photo: any) => photo.isPublic);
        this.organizePhotosByLocation();
        this.startAutoCarousels();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading photos:', error);
        alert('Erreur lors du chargement des photos: ' + (error.error?.message || error.message));
        this.loading = false;
      }
    });
  }

  organizePhotosByLocation(): void {
    const locationGroups: { [key: string]: any[] } = {};
    
    // Group photos by location
    this.photos.forEach(photo => {
      let location = photo.location || 'Lieu non spécifié';
      
      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(photo);
    });

    // Convert to array format with current index
    this.photosByLocation = Object.keys(locationGroups)
      .sort()
      .map(location => ({
        location,
        photos: locationGroups[location],
        currentIndex: 0
      }));
    
    // Apply filters
    this.filterPhotos();
  }

  filterPhotos(): void {
    // Filter photos first
    const filtered = this.photos.filter(photo => {
      const matchesCategory = !this.selectedCategory || photo.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        photo.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (photo.description && photo.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (photo.location && photo.location.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (photo.tags && photo.tags.some((tag: string) => 
          tag.toLowerCase().includes(this.searchTerm.toLowerCase())
        ));
      
      return matchesCategory && matchesSearch;
    });

    // Reorganize by location with filtered photos
    const locationGroups: { [key: string]: any[] } = {};
    
    filtered.forEach(photo => {
      let location = photo.location || 'Lieu non spécifié';
      
      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(photo);
    });

    this.photosByLocation = Object.keys(locationGroups)
      .sort()
      .map(location => ({
        location,
        photos: locationGroups[location],
        currentIndex: 0
      }));

    this.filteredPhotos = filtered;
    
    // Restart auto-carousels after filtering
    this.startAutoCarousels();
  }

  // Auto-carousel functionality
  startAutoCarousels(): void {
    // Clear existing intervals
    Object.values(this.autoCarouselIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    this.autoCarouselIntervals = {};

    // Start auto-carousel for each location with more than 1 photo
    this.photosByLocation.forEach(locationGroup => {
      if (locationGroup.photos.length > 1) {
        this.autoCarouselIntervals[locationGroup.location] = setInterval(() => {
          this.nextPhoto(locationGroup);
        }, 4000); // Change photo every 4 seconds
      }
    });
  }

  // Navigation in carousel
  previousPhoto(locationGroup: any): void {
    if (locationGroup.photos.length > 0) {
      locationGroup.currentIndex = 
        locationGroup.currentIndex > 0 ? 
        locationGroup.currentIndex - 1 : 
        locationGroup.photos.length - 1;
      
      // Reset auto-carousel timer
      this.resetAutoCarousel(locationGroup.location);
    }
  }

  nextPhoto(locationGroup: any): void {
    if (locationGroup.photos.length > 0) {
      locationGroup.currentIndex = 
        locationGroup.currentIndex < locationGroup.photos.length - 1 ? 
        locationGroup.currentIndex + 1 : 
        0;
      
      // Reset auto-carousel timer
      this.resetAutoCarousel(locationGroup.location);
    }
  }

  goToPhoto(locationGroup: any, index: number): void {
    locationGroup.currentIndex = index;
    this.resetAutoCarousel(locationGroup.location);
  }

  private resetAutoCarousel(location: string): void {
    // Clear existing interval
    if (this.autoCarouselIntervals[location]) {
      clearInterval(this.autoCarouselIntervals[location]);
    }
    
    // Restart interval
    const locationGroup = this.photosByLocation.find(group => group.location === location);
    if (locationGroup && locationGroup.photos.length > 1) {
      this.autoCarouselIntervals[location] = setInterval(() => {
        this.nextPhoto(locationGroup);
      }, 4000);
    }
  }

  openPhotoModal(photo: any): void {
    this.selectedPhoto = photo;
    this.currentPhotoIndex = this.filteredPhotos.findIndex(p => p._id === photo._id);
  }

  closePhotoModal(): void {
    this.selectedPhoto = null;
    this.currentPhotoIndex = 0;
  }

  previousPhotoModal(): void {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
      this.selectedPhoto = this.filteredPhotos[this.currentPhotoIndex];
    }
  }

  nextPhotoModal(): void {
    if (this.currentPhotoIndex < this.filteredPhotos.length - 1) {
      this.currentPhotoIndex++;
      this.selectedPhoto = this.filteredPhotos[this.currentPhotoIndex];
    }
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      conference: 'Mathematical Conferences',
      research: 'Research & Laboratory',
      teaching: 'Teaching',
      awards: 'Awards & Distinctions',
      collaboration: 'Collaborations',
      seminar: 'Seminars',
      workshop: 'Workshops'
    };
    return labels[category] || category;
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchTerm = '';
    this.filterPhotos();
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
