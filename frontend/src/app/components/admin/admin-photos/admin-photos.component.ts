import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-photos',
  templateUrl: './admin-photos.component.html',
  styleUrls: ['./admin-photos.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class AdminPhotosComponent implements OnInit {
  photos: any[] = [];
  filteredPhotos: any[] = [];
  photoForm: FormGroup;
  loading = false;
  saving = false;
  showDialog = false;
  showPhotoModal = false;
  editingPhoto: any = null;
  selectedPhoto: any = null;
  selectedFiles: File[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  // Filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedYear = '';
  availableYears: number[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.photoForm = this.createPhotoForm();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadPhotos();
  }

  createPhotoForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['research'],
      date: [new Date()],
      location: [''],
      photographer: [''],
      tagsInput: [''],
      altText: [''],
      credit: [''],
      people: this.fb.array([]),
      isPublic: [true],
      isFeatured: [false],
      allowDownload: [true]
    });
  }

  get people(): FormArray {
    return this.photoForm.get('people') as FormArray;
  }

  loadPhotos(): void {
    this.loading = true;
    this.apiService.getPhotosAdmin().subscribe({
      next: (data) => {
        this.photos = data || [];
        this.filteredPhotos = [...this.photos];
        this.updateAvailableYears();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading photos:', error);
        alert('Erreur lors du chargement des photos: ' + (error.error?.message || error.message));
        this.loading = false;
      }
    });
  }

  updateAvailableYears(): void {
    const years = this.photos.map(photo => new Date(photo.date).getFullYear()).filter(year => year);
    this.availableYears = [...new Set(years)].sort((a, b) => b - a);
  }

  filterPhotos(): void {
    this.filteredPhotos = this.photos.filter(photo => {
      const matchesSearch = !this.searchTerm || 
        photo.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        photo.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        photo.tags?.some((tag: string) => 
          tag.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        photo.location?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        photo.photographer?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || photo.category === this.selectedCategory;
      const matchesYear = !this.selectedYear || 
        new Date(photo.date).getFullYear().toString() === this.selectedYear;

      return matchesSearch && matchesCategory && matchesYear;
    });
  }

  onViewModeChange(): void {
    // View mode changed
  }

  openAddDialog(): void {
    this.editingPhoto = null;
    this.photoForm.reset();
    this.photoForm.patchValue({
      category: 'research',
      date: new Date(),
      isPublic: true,
      isFeatured: false,
      allowDownload: true
    });
    this.people.clear();
    this.selectedFiles = [];
    this.showDialog = true;
  }

  editPhoto(photo: any): void {
    this.editingPhoto = photo;
    this.populateForm(photo);
    this.showDialog = true;
    this.showPhotoModal = false;
  }

  populateForm(photo: any): void {
    this.photoForm.patchValue({
      title: photo.title || '',
      description: photo.description || '',
      category: photo.category || 'research',
      date: photo.date ? new Date(photo.date) : new Date(),
      location: photo.location || '',
      photographer: photo.photographer || '',
      tagsInput: photo.tags ? photo.tags.join(', ') : '',
      altText: photo.altText || '',
      credit: photo.credit || '',
      isPublic: photo.isPublic !== undefined ? photo.isPublic : true,
      isFeatured: photo.isFeatured || false,
      allowDownload: photo.allowDownload !== undefined ? photo.allowDownload : true
    });

    const peopleArray = this.people;
    peopleArray.clear();
    if (photo.people && photo.people.length > 0) {
      photo.people.forEach((person: any) => {
        peopleArray.push(this.fb.group({
          name: [person.name || ''],
          role: [person.role || '']
        }));
      });
    }
  }

  addPerson(): void {
    this.people.push(this.fb.group({
      name: [''],
      role: ['']
    }));
  }

  removePerson(index: number): void {
    this.people.removeAt(index);
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = files.filter(file => file.type.startsWith('image/'));
    if (this.selectedFiles.length === 0) {
      alert('Veuillez sélectionner des fichiers image valides.');
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  openPhotoModal(photo: any): void {
    this.selectedPhoto = photo;
    this.showPhotoModal = true;
  }

  closePhotoModal(): void {
    this.showPhotoModal = false;
    this.selectedPhoto = null;
  }

  downloadPhoto(photo: any): void {
    if (photo.imageUrl && photo.allowDownload) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${photo.imageUrl}`;
      link.download = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      link.target = '_blank';
      link.click();
    } else {
      alert('Le téléchargement n\'est pas autorisé pour cette photo.');
    }
  }

  savePhoto(): void {
    if (!this.photoForm.valid) {
      this.markFormGroupTouched(this.photoForm);
      return;
    }

    if (!this.editingPhoto && this.selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins une image.');
      return;
    }

    this.saving = true;

    if (this.editingPhoto) {
      const formData = this.prepareFormData();
      this.apiService.updatePhoto(this.editingPhoto._id, formData).subscribe({
        next: (response) => {
          this.saving = false;
          this.closeDialog();
          this.loadPhotos();
        },
        error: (error) => {
          console.error('Error updating photo:', error);
          alert('Erreur lors de la mise à jour: ' + (error.error?.message || error.message));
          this.saving = false;
        }
      });
    } else {
      this.uploadNewPhotos();
    }
  }

  uploadNewPhotos(): void {
    const formData = this.prepareFormData();
    const uploadPromises: Promise<any>[] = [];

    this.selectedFiles.forEach(file => {
      uploadPromises.push(
        this.apiService.createPhoto(formData, file).toPromise()
      );
    });

    Promise.all(uploadPromises).then((responses) => {
      this.saving = false;
      this.closeDialog();
      this.loadPhotos();
    }).catch(error => {
      console.error('Error uploading photos:', error);
      alert('Erreur lors de l\'upload: ' + (error.error?.message || error.message));
      this.saving = false;
    });
  }

  deletePhoto(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      this.apiService.deletePhoto(id).subscribe({
        next: () => {
          this.loadPhotos();
        },
        error: (error) => {
          console.error('Error deleting photo:', error);
          alert('Erreur lors de la suppression: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingPhoto = null;
    this.selectedFiles = [];
    this.photoForm.reset();
    this.people.clear();
  }

  prepareFormData(): any {
    const formValue = this.photoForm.value;
    
    const tags = formValue.tagsInput 
      ? formValue.tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      : [];

    const people = formValue.people.filter((person: any) => person.name || person.role);

    return {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      date: formValue.date,
      location: formValue.location,
      photographer: formValue.photographer,
      tags: tags,
      altText: formValue.altText,
      credit: formValue.credit,
      people: people,
      isPublic: formValue.isPublic,
      isFeatured: formValue.isFeatured,
      allowDownload: formValue.allowDownload
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  getCategoryLabel(category: string): string {
    const categories: { [key: string]: string } = {
      research: 'Recherche',
      teaching: 'Enseignement',
      conference: 'Conférences',
      awards: 'Récompenses',
      team: 'Équipe',
      events: 'Événements',
      personal: 'Personnel'
    };
    return categories[category] || category;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  bulkUpdateVisibility(isPublic: boolean): void {
    if (confirm(`Voulez-vous ${isPublic ? 'rendre publiques' : 'rendre privées'} toutes les photos filtrées ?`)) {
      const updatePromises = this.filteredPhotos.map(photo => 
        this.apiService.updatePhoto(photo._id, { ...photo, isPublic }).toPromise()
      );

      Promise.all(updatePromises).then(() => {
        this.loadPhotos();
      }).catch(error => {
        console.error('Error updating photos visibility:', error);
        alert('Erreur lors de la mise à jour: ' + (error.error?.message || error.message));
      });
    }
  }

  bulkDelete(): void {
    if (confirm(`Voulez-vous supprimer toutes les photos filtrées (${this.filteredPhotos.length} photos) ?`)) {
      const deletePromises = this.filteredPhotos.map(photo => 
        this.apiService.deletePhoto(photo._id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.loadPhotos();
      }).catch(error => {
        console.error('Error deleting photos:', error);
        alert('Erreur lors de la suppression: ' + (error.error?.message || error.message));
      });
    }
  }

  sortPhotos(sortBy: 'date' | 'title' | 'category'): void {
    this.filteredPhotos.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }

  getPhotoStats(): any {
    const stats = {
      total: this.photos.length,
      public: this.photos.filter(p => p.isPublic).length,
      featured: this.photos.filter(p => p.isFeatured).length,
      byCategory: {} as any
    };

    this.photos.forEach(photo => {
      const category = photo.category || 'other';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }
}