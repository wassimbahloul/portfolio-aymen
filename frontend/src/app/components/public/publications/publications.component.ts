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
      const matchesSearch = !this.searchTerm || 
        publication.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        publication.journal.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        publication.authors.some((author: any) => 
          author.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }

  toggleAbstract(index: number): void {
    this.expandedAbstracts[index] = !this.expandedAbstracts[index];
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'journal': 'Journal',
      'conference': 'Conférence',
      'book': 'Livre',
      'chapter': 'Chapitre',
      'preprint': 'Prépublication'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'published': 'Publié',
      'accepted': 'Accepté',
      'submitted': 'Soumis',
      'in_preparation': 'En préparation'
    };
    return labels[status] || status;
  }
}

