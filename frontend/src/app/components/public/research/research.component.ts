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
  expandedTags: { [key: number]: boolean } = {};
  selectedImage: string | null = null;
  
  // Image modal properties
  showImageModal = false;
  currentImages: string[] = [];
  currentImageIndex = 0;
  currentProjectTitle = '';

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

  toggleTags(index: number): void {
    this.expandedTags[index] = !this.expandedTags[index];
  }

  getDisplayedTags(tags: string[], index: number): string[] {
    if (!Array.isArray(tags)) return [];
    
    if (this.expandedTags[index] || tags.length <= 5) {
      return tags;
    }
    
    return tags.slice(0, 5);
  }

  openImageModal(images: string[], index: number, projectTitle: string): void {
    this.currentImages = images;
    this.currentImageIndex = index;
    this.currentProjectTitle = projectTitle;
    this.showImageModal = true;
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }

  closeImageModal(): void {
    this.showImageModal = false;
    document.body.style.overflow = 'auto'; // Restore body scroll
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ongoing': 'Ongoing',
      'completed': 'Completed',
      'planned': 'Planned',
      'collaboration': 'Collaboration'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  hasItems(array: any[]): boolean {
    return Array.isArray(array) && array.length > 0;
  }

  hasMetaInfo(project: any): boolean {
    return project.startDate || project.endDate || project.institution || project.location;
  }

  hasFunding(project: any): boolean {
    return this.hasItems(project.funding);
  }

  hasCollaborators(project: any): boolean {
    return this.hasItems(project.collaborators);
  }

  hasExternalLinks(project: any): boolean {
    return this.hasItems(project.externalLinks);
  }

  hasAdditionalInfo(project: any): boolean {
    return this.hasFunding(project) || this.hasCollaborators(project) || 
           this.hasExternalLinks(project) || this.hasItems(project.images) ||
           this.hasItems(project.publications) || this.hasItems(project.supervisor);
  }

  hasValidContent(obj: any, ...fields: string[]): boolean {
    if (!obj) return false;
    return fields.some(field => obj[field] && obj[field].toString().trim() !== '');
  }

  getImageUrl(image: string): string {
    return image ? `${environment.apiUrl}${image}` : '';
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.currentImages.length - 1) {
      this.currentImageIndex++;
    }
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/image-placeholder.png';
  }
}