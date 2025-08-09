import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-teaching',
  templateUrl: './admin-teaching.component.html',
  styleUrls: ['./admin-teaching.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class AdminTeachingComponent implements OnInit {
  courses: any[] = [];
  filteredCourses: any[] = [];
  courseForm: FormGroup;
  loading = false;
  saving = false;
  showDialog = false;
  editingCourse: any = null;
  selectedFiles: File[] = [];

  // Filter properties
  searchTerm = '';
  selectedLevel = '';
  selectedYear = '';
  availableYears: string[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.courseForm = this.createCourseForm();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.loadCourses();
  }

  createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      level: ['undergraduate', Validators.required],
      institution: ['', Validators.required],
      department: [''],
      academicYear: [this.getCurrentAcademicYear()],
      semester: ['semester 1'],
      description: ['']
    });
  }

  getCurrentAcademicYear(): string {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    if (currentMonth < 7) {
      return `${currentYear - 1}-${currentYear}`;
    } else {
      return `${currentYear}-${currentYear + 1}`;
    }
  }

  loadCourses(): void {
    this.loading = true;
    this.apiService.getTeaching().subscribe({
      next: (data) => {
        this.courses = data || [];
        this.filteredCourses = [...this.courses];
        this.updateAvailableYears();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }

  updateAvailableYears(): void {
    const years = this.courses.map(course => course.academicYear).filter(year => year);
    this.availableYears = [...new Set(years)].sort().reverse();
  }

  filterCourses(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = !this.searchTerm || 
        course.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.institution?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.department?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;
      const matchesYear = !this.selectedYear || course.academicYear === this.selectedYear;

      return matchesSearch && matchesLevel && matchesYear;
    });
  }

  openAddDialog(): void {
    this.editingCourse = null;
    this.courseForm.reset();
    this.courseForm.patchValue({
      level: 'undergraduate',
      academicYear: this.getCurrentAcademicYear(),
      semester: 'semester 1'
    });
    this.selectedFiles = [];
    this.showDialog = true;
  }

  editCourse(course: any): void {
    this.editingCourse = course;
    this.populateForm(course);
    this.showDialog = true;
  }

  populateForm(course: any): void {
    this.courseForm.patchValue({
      title: course.title || '',
      level: course.level || 'undergraduate',
      institution: course.institution || '',
      department: course.department || '',
      academicYear: course.academicYear || this.getCurrentAcademicYear(),
      semester: course.semester || 'semester 1',
      description: course.description || ''
    });
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      if (file.type === 'application/pdf') {
        this.selectedFiles.push(file);
      }
    });
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  saveCourse(): void {
    if (!this.courseForm.valid) {
      this.markFormGroupTouched(this.courseForm);
      return;
    }

    this.saving = true;
    const formData = this.courseForm.value;

    const saveOperation = this.editingCourse
      ? this.apiService.updateTeaching(this.editingCourse._id, formData)
      : this.apiService.createTeaching(formData);

    saveOperation.subscribe({
      next: (response) => {
        if (this.selectedFiles.length > 0) {
          this.uploadCourseFiles(response._id || this.editingCourse?._id);
        } else {
          this.saving = false;
          this.closeDialog();
          this.loadCourses();
        }
      },
      error: (error) => {
        console.error('Error saving course:', error);
        this.saving = false;
      }
    });
  }

  uploadCourseFiles(courseId: string): void {
    if (this.selectedFiles.length === 0) return;

    this.apiService.uploadTeachingFiles(courseId, this.selectedFiles).subscribe({
      next: () => {
        this.saving = false;
        this.closeDialog();
        this.loadCourses();
      },
      error: (error) => {
        console.error('Error uploading course files:', error);
        this.saving = false;
      }
    });
  }

  deleteCourse(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      this.apiService.deleteTeaching(id).subscribe({
        next: () => {
          this.loadCourses();
        },
        error: (error) => {
          console.error('Error deleting course:', error);
        }
      });
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingCourse = null;
    this.selectedFiles = [];
    this.courseForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods
  getLevelLabel(level: string): string {
    const levels: { [key: string]: string } = {
      'undergraduate': 'Licence',
      'graduate': 'Master',
      'phd': 'Doctorat'
    };
    return levels[level] || level;
  }

  getSemesterLabel(semester: string): string {
  const semesters: { [key: string]: string } = {
    'semester 1': 'Semestre 1',
    'semester 2': 'Semestre 2'
  };
  return semesters[semester] || semester;
}

}