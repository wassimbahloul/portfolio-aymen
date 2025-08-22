import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css']
})
export class PublicationsComponent implements OnInit {
  publications: any[] = [];
  filteredPublications: any[] = [];
  loading = true;
  
  // Filter properties
  selectedType = '';
  selectedStatus = '';
  searchTerm = '';
  
  // UI state
  expandedAbstracts: { [key: number]: boolean } = {};

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadPublications();
  }

  loadPublications(): void {
    this.loading = true;
    this.apiService.getPublications().subscribe({
      next: (data) => {
        this.publications = data;
        this.filteredPublications = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading publications:', error);
        this.loading = false;
      }
    });
  }

  filterPublications(): void {
    this.filteredPublications = this.publications.filter(publication => {
      const matchesType = !this.selectedType || publication.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || publication.status === this.selectedStatus;
      
      if (!this.searchTerm) {
        return matchesType && matchesStatus;
      }
      
      const searchLower = this.searchTerm.toLowerCase();
      const matchesTitle = publication.title?.toLowerCase().includes(searchLower) || false;
      const matchesJournal = publication.journal?.toLowerCase().includes(searchLower) || false;
      const matchesAuthors = publication.authors?.some((author: any) => 
        author.name?.toLowerCase().includes(searchLower)
      ) || false;
      
      const matchesSearch = matchesTitle || matchesJournal || matchesAuthors;
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }

  toggleAbstract(index: number): void {
    this.expandedAbstracts[index] = !this.expandedAbstracts[index];
  }

  resetFilters(): void {
    this.selectedType = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.filterPublications();
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'journal': 'Journal Articles',
      'conference': 'Conference Papers',
      'book': 'Books',
      'chapter': 'Book Chapters',
      'preprint': 'Preprints'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'published': 'Published',
      'accepted': 'Accepted',
      'submitted': 'Submitted',
      'in_preparation': 'In Preparation'
    };
    return labels[status] || status;
  }
}

