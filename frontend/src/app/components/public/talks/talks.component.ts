import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-talks',
  templateUrl: './talks.component.html',
  styleUrls: ['./talks.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class TalksComponent implements OnInit {
  allTalks: any[] = [];
  filteredTalks: any[] = [];
  filterType = '';
  searchTerm = '';
  sortBy = 'date-desc';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTalks();
  }

  loadTalks() {
    const filters = this.filterType ? { type: this.filterType } : {};
    this.api.getTalks(filters).subscribe(
      data => {
        console.log('Talks received:', data); // Debug log
        this.allTalks = data;
        this.applyFiltersAndSort();
      },
      error => {
        console.error('Error loading talks:', error); // Error log
      }
    );
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

  getSlideUrl(slide: string): string {
    return `${environment.apiUrl}/Uploads/${slide}`;
  }

  getTalkTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'talk': 'Plenary Conference',
      'international seminar': 'International Seminar',
      'poster': 'Scientific Poster',
      'organized seminar': 'Organized Seminar',
      'workshop': 'Research Workshop'
    };
    return typeLabels[type] || type;
  }

  formatDate(dateString: string): string {
    console.log('Formatting date:', dateString); // Debug log
    if (!dateString) return 'Date non spécifiée';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString);
      return dateString; // Return original string if date is invalid
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Getter for template to access filtered talks
  get talks() {
    return this.filteredTalks;
  }
}
