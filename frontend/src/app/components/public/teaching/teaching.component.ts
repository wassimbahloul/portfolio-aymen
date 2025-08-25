import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-teaching',
  templateUrl: './teaching.component.html',
  styleUrls: ['./teaching.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class TeachingComponent implements OnInit {
  courses: any[] = [];
  filteredCourses: any[] = [];
  institutions: string[] = [];
  loading = true;
  
  // Filter properties
  selectedLevel = '';
  selectedInstitution = '';
  searchTerm = '';
  
  // UI state
  expandedDescriptions: { [key: number]: boolean } = {};

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.apiService.getTeaching().subscribe({
      next: (data) => {
        this.courses = data.sort((a: any, b: any) => {
          // Sort by academicYear descending, then by semester
          if (a.academicYear !== b.academicYear) {
            return b.academicYear?.localeCompare(a.academicYear) || 0;
          }
          return b.semester?.localeCompare(a.semester) || 0;
        });
        this.filteredCourses = this.courses;
        this.extractInstitutions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }

  extractInstitutions(): void {
    const institutionSet = new Set<string>();
    this.courses.forEach(course => {
      if (course.institution) {
        institutionSet.add(course.institution);
      }
    });
    this.institutions = Array.from(institutionSet).sort();
  }

  filterCourses(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;
      const matchesInstitution = !this.selectedInstitution || course.institution === this.selectedInstitution;
      const matchesSearch = !this.searchTerm || 
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (course.department && course.department.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesLevel && matchesInstitution && matchesSearch;
    });
  }

  toggleDescription(index: number): void {
    this.expandedDescriptions[index] = !this.expandedDescriptions[index];
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'undergraduate': 'Licence',
      'graduate': 'Master',
      'phd': 'Doctorat'
    };
    return labels[level] || level;
  }

  getSemesterLabel(semester: string): string {
  const semesters: { [key: string]: string } = {
    'semester 1': 'Semester 1',
    'semester 2': 'Semester 2'
  };
  return semesters[semester] || semester;
}

}
