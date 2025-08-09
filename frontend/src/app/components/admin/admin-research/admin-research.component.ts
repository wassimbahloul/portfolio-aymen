import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-admin-research',
  templateUrl: './admin-research.component.html',
  styleUrls: ['./admin-research.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminResearchComponent implements OnInit {
  projects: any[] = [];
  filteredProjects: any[] = [];
  loading = false;
  saving = false;
  expandedDescriptions: { [key: string]: boolean } = {};
  // Filter properties
  searchTerm = '';
  selectedStatus = '';
  
  // Dialog state
  showDialog = false;
  editingProject: any = null;
  projectForm: FormGroup;
  selectedImages: any[] = [];

  constructor(
    private overlay: Overlay,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.projectForm = this.createProjectForm();
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  createProjectForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      category: [''],
      status: ['ongoing'],
      startDate: [''],
      endDate: [''],
      description: [''],
      tagsInput: [''],
      collaborators: this.fb.array([]),
      supervisor: this.fb.array([]),
      funding: this.fb.array([]),
      externalLinks: this.fb.array([])
    });
  }

  get collaborators(): FormArray {
    return this.projectForm.get('collaborators') as FormArray;
  }

  get supervisor(): FormArray {
    return this.projectForm.get('supervisor') as FormArray;
  }

  get funding(): FormArray {
    return this.projectForm.get('funding') as FormArray;
  }

  get externalLinks(): FormArray {
    return this.projectForm.get('externalLinks') as FormArray;
  }

  loadProjects(): void {
    this.loading = true;
    this.apiService.getResearch().subscribe({
      next: (data) => {
        this.projects = data || [];
        this.filteredProjects = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loading = false;
      }
    });
  }

  filterProjects(): void {
    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = !this.searchTerm || 
        project.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || project.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  openAddDialog(): void {
    this.editingProject = null;
    this.projectForm = this.createProjectForm();
    this.selectedImages = [];
    this.showDialog = true;
  }

  editProject(project: any): void {
    this.editingProject = project;
    this.populateForm(project);
    this.selectedImages = [];
    this.showDialog = true;
  }

  populateForm(project: any): void {
    // Format dates for HTML input
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    this.projectForm.patchValue({
      title: project.title || '',
      category: project.category || '',
      status: project.status || 'ongoing',
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      description: project.description || '',
      tagsInput: project.tags ? project.tags.join(', ') : ''
    });

    // Populate collaborators
    const collaboratorsArray = this.collaborators;
    collaboratorsArray.clear();
    if (project.collaborators && project.collaborators.length > 0) {
      project.collaborators.forEach((collab: any) => {
        collaboratorsArray.push(this.fb.group({
          name: [collab.name || ''],
          institution: [collab.institution || ''],
          role: [collab.role || '']
        }));
      });
    }

    // Populate supervisors
    const supervisorArray = this.supervisor;
    supervisorArray.clear();
    if (project.supervisor && project.supervisor.length > 0) {
      project.supervisor.forEach((supervisor: any) => {
        supervisorArray.push(this.fb.group({
          name: [supervisor.name || ''],
          institution: [supervisor.institution || ''],
          role: [supervisor.role || '']
        }));
      });
    }

    // Populate funding
    const fundingArray = this.funding;
    fundingArray.clear();
    if (project.funding && project.funding.length > 0) {
      project.funding.forEach((fund: any) => {
        fundingArray.push(this.fb.group({
          source: [fund.source || ''],
          amount: [fund.amount || ''],
          period: [fund.period || '']
        }));
      });
    }

    // Populate external links
    const linksArray = this.externalLinks;
    linksArray.clear();
    if (project.externalLinks && project.externalLinks.length > 0) {
      project.externalLinks.forEach((link: any) => {
        linksArray.push(this.fb.group({
          title: [link.title || ''],
          url: [link.url || '']
        }));
      });
    }
  }

  addCollaborator(): void {
    this.collaborators.push(this.fb.group({
      name: [''],
      institution: [''],
      role: ['']
    }));
  }

  removeCollaborator(index: number): void {
    this.collaborators.removeAt(index);
  }

  addSupervisor(): void {
    this.supervisor.push(this.fb.group({
      name: [''],
      institution: [''],
      role: ['']
    }));
  }

  removeSupervisor(index: number): void {
    this.supervisor.removeAt(index);
  }

  addFunding(): void {
    this.funding.push(this.fb.group({
      source: [''],
      amount: [''],
      period: ['']
    }));
  }

  removeFunding(index: number): void {
    this.funding.removeAt(index);
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

  onImageSelected(event: any): void {
    const files = event.target.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push({
          file: file,
          name: file.name,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  saveProject(): void {
    if (!this.projectForm.valid) {
      console.log('Form invalid:', this.projectForm.errors);
      return;
    }

    this.saving = true;
    const formData = this.prepareFormData();

    const saveOperation = this.editingProject 
      ? this.apiService.updateResearch(this.editingProject._id, formData)
      : this.apiService.createResearch(formData);

    saveOperation.subscribe({
      next: (response) => {
        // Upload images if any
        if (this.selectedImages.length > 0) {
          this.uploadImages(response._id || this.editingProject._id);
        } else {
          this.saving = false;
          this.closeDialog();
          this.loadProjects();
        }
      },
      error: (error) => {
        console.error('Error saving project:', error);
        this.saving = false;
      }
    });
  }

  prepareFormData(): any {
    const formValue = this.projectForm.value;
    
    // Process tags
    const tags = formValue.tagsInput 
      ? formValue.tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      : [];

    // Filter out empty collaborators, supervisor, funding, and links
    const collaborators = formValue.collaborators?.filter((c: any) => 
      c.name?.trim() || c.institution?.trim() || c.role?.trim()
    ) || [];
    
    const supervisor = formValue.supervisor?.filter((s: any) => 
      s.name?.trim() || s.institution?.trim() || s.role?.trim()
    ) || [];
    
    const funding = formValue.funding?.filter((f: any) => 
      f.source?.trim() || f.amount?.trim() || f.period?.trim()
    ) || [];
    
    const externalLinks = formValue.externalLinks?.filter((l: any) => 
      l.title?.trim() || l.url?.trim()
    ) || [];

    return {
      title: formValue.title?.trim() || '',
      category: formValue.category?.trim() || '',
      status: formValue.status || 'ongoing',
      startDate: formValue.startDate || null,
      endDate: formValue.endDate || null,
      description: formValue.description?.trim() || '',
      tags: tags,
      collaborators: collaborators,
      supervisor: supervisor, // Changed from supervisors to supervisor
      funding: funding,
      externalLinks: externalLinks
    };
  }

  uploadImages(projectId: string): void {
    let uploadCount = 0;
    const totalImages = this.selectedImages.length;

    this.selectedImages.forEach(image => {
      this.apiService.uploadResearchImage(projectId, image.file).subscribe({
        next: () => {
          uploadCount++;
          if (uploadCount === totalImages) {
            this.saving = false;
            this.closeDialog();
            this.loadProjects();
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          uploadCount++;
          if (uploadCount === totalImages) {
            this.saving = false;
            this.closeDialog();
            this.loadProjects();
          }
        }
      });
    });
  }

  deleteProject(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.apiService.deleteResearch(id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          console.error('Error deleting project:', error);
        }
      });
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingProject = null;
    this.selectedImages = [];
    this.projectForm = this.createProjectForm();
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

  ngAfterViewInit() {
    // Force repositioning of Material overlays
    const overlayContainer = document.querySelector('.cdk-overlay-container');
    if (overlayContainer) {
      overlayContainer.setAttribute('style', `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 1000 !important;
      `);
    }
  }
  toggleDescription(project: any) {
    this.expandedDescriptions[project._id] = !this.expandedDescriptions[project._id];
  }
}