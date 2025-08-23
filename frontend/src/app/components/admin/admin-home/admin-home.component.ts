import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  homeForm: FormGroup;
  homeData: any = {};
  loading = true;
  saving = false;
  selectedImageName = '';
  currentProfileImage = '';
  imagePreview: string | null = null;
  selectedProfileImage: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.homeForm = this.formBuilder.group({
      title: [''],
      subtitle: [''],
      description: [''],
      upcomingEvents: this.formBuilder.array([]),
      onlineSeminars: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    
    this.loadHomeData();
  }

  get eventsControls() {
    return (this.homeForm.get('upcomingEvents') as FormArray).controls;
  }

  get seminarsControls() {
    return (this.homeForm.get('onlineSeminars') as FormArray).controls;
  }

  loadHomeData(): void {
    this.loading = true;
    this.apiService.getHome().subscribe({
      next: (data) => {
        this.homeData = data;
        this.currentProfileImage = data.profileImage || '';
        this.populateForm(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading home data:', error);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 3000 });
      }
    });
  }

  populateForm(data: any): void {
    this.homeForm.patchValue({
      title: data.title || '',
      subtitle: data.subtitle || '',
      description: data.description || ''
    });

    // Populate events array
    const eventsArray = this.homeForm.get('upcomingEvents') as FormArray;
    eventsArray.clear();
    if (data.upcomingEvents) {
      data.upcomingEvents.forEach((event: any) => {
        eventsArray.push(this.createEventGroup(event));
      });
    }

    // Populate seminars array
    const seminarsArray = this.homeForm.get('onlineSeminars') as FormArray;
    seminarsArray.clear();
    if (data.onlineSeminars) {
      data.onlineSeminars.forEach((seminar: any) => {
        seminarsArray.push(this.createSeminarGroup(seminar));
      });
    }
  }

  createEventGroup(event?: any): FormGroup {
    return this.formBuilder.group({
      title: [event?.title || ''],
      date: [event?.date || ''],
      location: [event?.location || ''],
      description: [event?.description || ''],
      link: [event?.link || '']
    });
  }

  createSeminarGroup(seminar?: any): FormGroup {
    return this.formBuilder.group({
      title: [seminar?.title || ''],
      description: [seminar?.description || ''],
      link: [seminar?.link || ''],
      youtubeChannel: [seminar?.youtubeChannel || '']
    });
  }

  addEvent(): void {
    const eventsArray = this.homeForm.get('upcomingEvents') as FormArray;
    eventsArray.push(this.createEventGroup());
  }

  removeEvent(index: number): void {
    const eventsArray = this.homeForm.get('upcomingEvents') as FormArray;
    eventsArray.removeAt(index);
  }

  addSeminar(): void {
    const seminarsArray = this.homeForm.get('onlineSeminars') as FormArray;
    seminarsArray.push(this.createSeminarGroup());
  }

  removeSeminar(index: number): void {
    const seminarsArray = this.homeForm.get('onlineSeminars') as FormArray;
    seminarsArray.removeAt(index);
  }

  onProfileImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedProfileImage = file;
      this.selectedImageName = file.name;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfileImage(): void {
    this.selectedProfileImage = null;
    this.selectedImageName = '';
    this.imagePreview = null;
    this.currentProfileImage = '';
  }

  onSubmit(): void {
    if (this.homeForm.valid) {
      this.saving = true;
      
      // If there's a new profile image, upload it first
      if (this.selectedProfileImage) {
        this.apiService.uploadHomeImage(this.selectedProfileImage).subscribe({
          next: (response) => {
            this.updateHomeData(response.imageUrl);
          },
          error: (error) => {
            this.saving = false;
            console.error('Error uploading profile image:', error);
            this.snackBar.open('Erreur lors de l\'upload de l\'image', 'Fermer', { duration: 3000 });
          }
        });
      } else {
        this.updateHomeData(this.currentProfileImage);
      }
    }
  }

  private updateHomeData(profileImageUrl: string): void {
    const formData = {
      ...this.homeForm.value,
      profileImage: profileImageUrl
    };

    this.apiService.updateHome(formData).subscribe({
      next: (response) => {
        this.saving = false;
        this.snackBar.open('Données sauvegardées avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error saving home data:', error);
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
      }
    });
  }
}

