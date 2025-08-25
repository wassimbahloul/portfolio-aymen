import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-talks',
  templateUrl: './admin-talks.component.html',
  styleUrls: ['./admin-talks.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class AdminTalksComponent implements OnInit {
  allTalks: any[] = [];
  filteredTalks: any[] = [];
  filterType = '';
  searchTerm = '';
  sortBy = 'date-desc';
  slideFile: File | null = null;
  showModal = false;
  existingSlide: string | null = null;
  fileError: string | null = null;

  formData = {
    type: '',
    date: '',
    name: '',
    link: ''
  };

  selectedTalk: any = null;

  constructor(private api: ApiService) {}

  
  ngOnInit() {
    this.loadTalks();
  }

  loadTalks() {
    const filters = this.filterType ? { type: this.filterType } : {};
    this.api.getTalks(filters).subscribe(res => {
      this.allTalks = res;
      this.applyFiltersAndSort();
    });
  }

  applyFiltersAndSort() {
    let filtered = [...this.allTalks];

    // Apply type filter
    if (this.filterType) {
      filtered = filtered.filter(talk => talk.type === this.filterType);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(talk => 
        talk.name.toLowerCase().includes(searchLower) ||
        talk.date.toLowerCase().includes(searchLower) ||
        talk.type.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered = this.sortTalks(filtered);

    this.filteredTalks = filtered;
  }

  sortTalks(talks: any[]): any[] {
    return talks.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  onSearch() {
    this.applyFiltersAndSort();
  }

  onSort() {
    this.applyFiltersAndSort();
  }

  clearFilters() {
    this.filterType = '';
    this.searchTerm = '';
    this.sortBy = 'date-desc';
    this.applyFiltersAndSort();
  }

  openModal() {
    this.showModal = true;
    this.reset();
  }

  closeModal() {
    this.showModal = false;
    this.reset();
  }

  submit() {
    // Validate file type before submission
    if (this.formData.type !== 'organized seminar' && this.slideFile && !this.isValidFileType(this.slideFile)) {
      this.fileError = 'Please upload a valid PDF file';
      return;
    }

    if (this.selectedTalk) {
      // Update existing talk
      this.api.updateTalk(this.selectedTalk._id, this.formData).subscribe({
        next: () => {
          if (this.slideFile && this.formData.type !== 'organized seminar') {
            this.api.uploadTalkSlides(this.selectedTalk._id, this.slideFile).subscribe({
              next: () => {
                this.closeModal();
                this.loadTalks();
              },
              error: (err) => {
                this.fileError = 'Failed to upload slide: ' + err.message;
              }
            });
          } else {
            this.closeModal();
            this.loadTalks();
          }
        },
        error: (err) => {
          this.fileError = 'Failed to update talk: ' + err.message;
        }
      });
    } else {
      // Create new talk
      this.api.createTalk(this.formData).subscribe({
        next: (talk) => {
          if (this.slideFile && this.formData.type !== 'organized seminar') {
            this.api.uploadTalkSlides(talk._id, this.slideFile).subscribe({
              next: () => {
                this.closeModal();
                this.loadTalks();
              },
              error: (err) => {
                this.fileError = 'Failed to upload slide: ' + err.message;
              }
            });
          } else {
            this.closeModal();
            this.loadTalks();
          }
        },
        error: (err) => {
          this.fileError = 'Failed to create talk: ' + err.message;
        }
      });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.slideFile = file;
    this.fileError = null;

    // Validate file type
    if (file && !this.isValidFileType(file)) {
      this.fileError = 'Only PDF files are allowed';
      this.slideFile = null;
    }

    // Add visual feedback for file selection
    const fileArea = event.target.closest('.file-upload-area');
    if (file && !this.fileError) {
      fileArea?.classList.add('has-file');
    } else {
      fileArea?.classList.remove('has-file');
    }
  }

  onTypeChange() {
    // Reset slide file if type is 'organized seminar'
    if (this.formData.type === 'organized seminar') {
      this.slideFile = null;
      this.fileError = null;
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }

  isValidFileType(file: File): boolean {
    return file && file.type === 'application/pdf';
  }

  getSlideUrl(slide: string): string {
    return `${environment.apiUrl}/Uploads/${slide}`;
  }

  edit(talk: any) {
    this.selectedTalk = talk;
    this.formData = {
      type: talk.type,
      date: talk.date,
      name: talk.name,
      link: talk.link || ''
    };
    this.existingSlide = talk.slide || null;
    this.fileError = null;
    this.showModal = true;
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this talk?')) {
      this.api.deleteTalk(id).subscribe(() => {
        this.loadTalks();
      });
    }
  }

  reset() {
    this.formData = { type: '', date: '', name: '', link: '' };
    this.selectedTalk = null;
    this.slideFile = null;
    this.existingSlide = null;
    this.fileError = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Getter for template to access filtered talks
  get talks() {
    return this.filteredTalks;
  }
getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'talk': '#28a745',
      'international seminar': '#007bff',
      'poster': '#6c757d',
      'organized seminar': '#d4a017'
    };
    return colors[type] || 'transparent';
}
}
