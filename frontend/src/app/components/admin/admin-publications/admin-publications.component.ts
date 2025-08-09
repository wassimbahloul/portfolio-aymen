import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-publications',
  templateUrl: './admin-publications.component.html',
  styleUrls: ['./admin-publications.component.css']
})
export class AdminPublicationsComponent implements OnInit {
  publications: any[] = [];
  filteredPublications: any[] = [];
  publicationForm: FormGroup;
  loading = false;
  saving = false;
  showDialog = false;
  editingPublication: any = null;
  selectedFile: File | null = null;

  // Filter properties
  searchTerm = '';
  selectedType = '';
  selectedYear = '';
  availableYears: number[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.publicationForm = this.createPublicationForm();
  }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadPublications();
  }

  createPublicationForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      type: ['journal'],
      year: [new Date().getFullYear()],
      authorsInput: [''],
      abstract: [''],
      
      // Journal specific
      journal: [''],
      volume: [''],
      issue: [''],
      pages: [''],
      
      // Conference specific
      conference: [''],
      location: [''],
      
      // Book/Chapter specific
      publisher: [''],
      editors: [''],
      
      // Common fields
      doi: [''],
      isbn: [''],
      citations: [0],
      downloads: [0],
      keywordsInput: [''],
      
      // External links
      externalLinks: this.fb.array([])
    });
  }

  get externalLinks(): FormArray {
    return this.publicationForm.get('externalLinks') as FormArray;
  }

  loadPublications(): void {
    this.loading = true;
    this.apiService.getPublications().subscribe({
      next: (data) => {
        this.publications = data || [];
        this.filteredPublications = [...this.publications];
        this.updateAvailableYears();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading publications:', error);
        this.loading = false;
      }
    });
  }

  updateAvailableYears(): void {
    const years = this.publications.map(pub => pub.year).filter(year => year);
    this.availableYears = [...new Set(years)].sort((a, b) => b - a);
  }

  filterPublications(): void {
    this.filteredPublications = this.publications.filter(publication => {
      const matchesSearch = !this.searchTerm || 
        publication.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        publication.authors?.some((author: string) => 
          author.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        publication.journal?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        publication.conference?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = !this.selectedType || publication.type === this.selectedType;
      const matchesYear = !this.selectedYear || publication.year?.toString() === this.selectedYear;

      return matchesSearch && matchesType && matchesYear;
    });
  }

  openAddDialog(): void {
    this.editingPublication = null;
    this.publicationForm.reset();
    this.publicationForm.patchValue({
      type: 'journal',
      year: new Date().getFullYear(),
      citations: 0,
      downloads: 0
    });
    this.externalLinks.clear();
    this.selectedFile = null;
    this.showDialog = true;
  }

  editPublication(publication: any): void {
    this.editingPublication = publication;
    this.populateForm(publication);
    this.showDialog = true;
  }

  populateForm(publication: any): void {
    this.publicationForm.patchValue({
      title: publication.title || '',
      type: publication.type || 'journal',
      year: publication.year || new Date().getFullYear(),
      authorsInput: publication.authors ? publication.authors.join(', ') : '',
      abstract: publication.abstract || '',
      journal: publication.journal || '',
      volume: publication.volume || '',
      issue: publication.issue || '',
      pages: publication.pages || '',
      conference: publication.conference || '',
      location: publication.location || '',
      publisher: publication.publisher || '',
      editors: publication.editors || '',
      doi: publication.doi || '',
      isbn: publication.isbn || '',
      citations: publication.citations || 0,
      downloads: publication.downloads || 0,
      keywordsInput: publication.keywords ? publication.keywords.join(', ') : ''
    });

    // Populate external links
    const linksArray = this.externalLinks;
    linksArray.clear();
    if (publication.externalLinks && publication.externalLinks.length > 0) {
      publication.externalLinks.forEach((link: any) => {
        linksArray.push(this.fb.group({
          title: [link.title || ''],
          url: [link.url || '']
        }));
      });
    }
  }

  addExternalLink(): void {
    this.externalLinks.push(this.fb.group({
      title: [''],
      url: ['']
    }));
  }

  removeExternalLink(index: number): void {
    this.externalLinks.removeAt(index);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert('Veuillez sélectionner un fichier PDF valide.');
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  openPDF(url: string): void {
    window.open(url, '_blank');
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  savePublication(): void {
    if (!this.publicationForm.valid) {
      this.markFormGroupTouched(this.publicationForm);
      return;
    }

    this.saving = true;
    const formData = this.prepareFormData();

    const saveOperation = this.editingPublication
      ? this.apiService.updatePublication(this.editingPublication._id, formData)
      : this.apiService.createPublication(formData);

    saveOperation.subscribe({
      next: (response) => {
        // Upload PDF file if selected
        if (this.selectedFile) {
          this.uploadPublicationFile(response._id || this.editingPublication?._id);
        } else {
          this.saving = false;
          this.closeDialog();
          this.loadPublications();
        }
      },
      error: (error) => {
        console.error('Error saving publication:', error);
        this.saving = false;
      }
    });
  }

  uploadPublicationFile(publicationId: string): void {
    if (!this.selectedFile) return;

    this.apiService.uploadPublicationFile(publicationId, this.selectedFile).subscribe({
      next: (response) => {
        this.saving = false;
        this.closeDialog();
        this.loadPublications();
      },
      error: (error) => {
        console.error('Error uploading publication file:', error);
        this.saving = false;
      }
    });
  }

  deletePublication(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      this.apiService.deletePublication(id).subscribe({
        next: () => {
          this.loadPublications();
        },
        error: (error) => {
          console.error('Error deleting publication:', error);
        }
      });
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingPublication = null;
    this.selectedFile = null;
    this.publicationForm.reset();
    this.externalLinks.clear();
  }

  prepareFormData(): any {
    const formValue = this.publicationForm.value;
    
    // Process authors
    const authors = formValue.authorsInput 
      ? formValue.authorsInput.split(',').map((author: string) => author.trim()).filter((author: string) => author)
      : [];

    // Process keywords
    const keywords = formValue.keywordsInput 
      ? formValue.keywordsInput.split(',').map((keyword: string) => keyword.trim()).filter((keyword: string) => keyword)
      : [];

    // Filter out empty external links
    const externalLinks = formValue.externalLinks.filter((link: any) => link.title || link.url);

    return {
      title: formValue.title,
      type: formValue.type,
      year: formValue.year,
      authors: authors,
      abstract: formValue.abstract,
      journal: formValue.journal,
      volume: formValue.volume,
      issue: formValue.issue,
      pages: formValue.pages,
      conference: formValue.conference,
      location: formValue.location,
      publisher: formValue.publisher,
      editors: formValue.editors,
      doi: formValue.doi,
      isbn: formValue.isbn,
      citations: formValue.citations || 0,
      downloads: formValue.downloads || 0,
      keywords: keywords,
      externalLinks: externalLinks
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

  // Helper methods
  getTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'journal': 'Article de journal',
      'conference': 'Conférence',
      'book': 'Livre',
      'chapter': 'Chapitre de livre',
      'thesis': 'Thèse',
      'preprint': 'Preprint'
    };
    return types[type] || type;
  }

  formatAuthors(authors: string[]): string {
    if (!authors || authors.length === 0) return '';
    if (authors.length <= 3) return authors.join(', ');
    return `${authors.slice(0, 3).join(', ')} et al.`;
  }

  formatCitation(publication: any): string {
    let citation = '';
    
    if (publication.authors && publication.authors.length > 0) {
      citation += this.formatAuthors(publication.authors) + '. ';
    }
    
    citation += `"${publication.title}". `;
    
    if (publication.type === 'journal' && publication.journal) {
      citation += `${publication.journal}`;
      if (publication.volume) citation += ` ${publication.volume}`;
      if (publication.issue) citation += `(${publication.issue})`;
      if (publication.pages) citation += `: ${publication.pages}`;
      citation += '. ';
    } else if (publication.type === 'conference' && publication.conference) {
      citation += `In ${publication.conference}`;
      if (publication.location) citation += `, ${publication.location}`;
      if (publication.pages) citation += `, pp. ${publication.pages}`;
      citation += '. ';
    }
    
    if (publication.year) citation += `${publication.year}.`;
    
    return citation;
  }

  exportBibTeX(publication: any): string {
    const type = publication.type === 'journal' ? 'article' : 
                 publication.type === 'conference' ? 'inproceedings' : 
                 publication.type;
    
    let bibtex = `@${type}{${publication._id},\n`;
    bibtex += `  title={${publication.title}},\n`;
    
    if (publication.authors && publication.authors.length > 0) {
      bibtex += `  author={${publication.authors.join(' and ')}},\n`;
    }
    
    if (publication.journal) bibtex += `  journal={${publication.journal}},\n`;
    if (publication.conference) bibtex += `  booktitle={${publication.conference}},\n`;
    if (publication.volume) bibtex += `  volume={${publication.volume}},\n`;
    if (publication.issue) bibtex += `  number={${publication.issue}},\n`;
    if (publication.pages) bibtex += `  pages={${publication.pages}},\n`;
    if (publication.year) bibtex += `  year={${publication.year}},\n`;
    if (publication.publisher) bibtex += `  publisher={${publication.publisher}},\n`;
    if (publication.doi) bibtex += `  doi={${publication.doi}},\n`;
    
    bibtex += '}';
    return bibtex;
  }
}

