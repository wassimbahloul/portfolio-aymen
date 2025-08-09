import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class ResearchComponent implements OnInit {
  researchProjects: any[] = [];
  filteredProjects: any[] = [];
  categories: string[] = [];
  loading = true;
  
  // Filter properties
  selectedCategory = '';
  selectedStatus = '';
  searchTerm = '';
  
  // UI state
  expandedDescriptions: { [key: number]: boolean } = {};
  selectedImage: string | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadResearchProjects();
  }

  loadResearchProjects(): void {
    this.loading = true;
    this.apiService.getResearch().subscribe({
      next: (data) => {
        this.researchProjects = data || [];
        this.filteredProjects = data || [];
        this.extractCategories();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading research projects:', error);
        this.loading = false;
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.researchProjects.forEach(project => {
      if (project?.category) {
        categorySet.add(project.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  filterProjects(): void {
    this.filteredProjects = this.researchProjects.filter(project => {
      const matchesCategory = !this.selectedCategory || project?.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || project?.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        (project?.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
        (project?.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
        (project?.tags?.some((tag: string) => 
          tag.toLowerCase().includes(this.searchTerm.toLowerCase()) || false
        )) ||
        (project?.supervisor?.some((supervisor: any) => 
          (supervisor?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
          (supervisor?.institution?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
          (supervisor?.role?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false)
        )) ||
        (project?.collaborators?.some((collab: any) => 
          (collab?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
          (collab?.institution?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
          (collab?.role?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false)
        ));
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }

  toggleDescription(index: number): void {
    this.expandedDescriptions[index] = !this.expandedDescriptions[index];
  }

  openImageModal(image: string): void {
    this.selectedImage = image;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ongoing': 'En cours',
      'completed': 'Terminé',
      'planned': 'Planifié'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  hasItems(array: any[]): boolean {
    return Array.isArray(array) && array.length > 0;
  }

  hasValidContent(obj: any, ...fields: string[]): boolean {
    if (!obj) return false;
    return fields.some(field => obj[field] && obj[field].toString().trim() !== '');
  }

  getImageUrl(image: string): string {
    return image ? `${environment.apiUrl}${image}` : '';
  }
}