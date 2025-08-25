import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-cv',
  templateUrl: './admin-cv.component.html',
  styleUrls: ['./admin-cv.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class AdminCvComponent implements OnInit {
  cvForm: FormGroup;
  loading = false;
  saving = false;
  showSuccessMessage = false;
  cvData: any = null;
  selectedCvFile: File | null = null;
  showCvModal = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cvForm = this.initializeForm();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    
    this.loadCvData();
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      fullName: [''],
      dateOfBirth: [''],
      nationality: [''],
      email: ['', [Validators.email]],
      otherInfo: [''],
      
      // Academic Employment Array
      academicEmployment: this.fb.array([]),
      
      // Education Array
      education: this.fb.array([])
    });
  }

  // Academic Employment Methods
  get academicEmployment(): FormArray {
    return this.cvForm.get('academicEmployment') as FormArray;
  }

  getEmploymentControls() {
    return this.academicEmployment.controls;
  }

  addEmployment(): void {
    const employmentGroup = this.fb.group({
      startDate: [''],
      endDate: [''],
      department: [''],
      institution: [''],
      description: ['']
    });
    
    this.academicEmployment.push(employmentGroup);
  }

  removeEmployment(index: number): void {
    this.academicEmployment.removeAt(index);
  }

  // Education Methods
  get education(): FormArray {
    return this.cvForm.get('education') as FormArray;
  }

  getEducationControls() {
    return this.education.controls;
  }

  addEducation(): void {
    const educationGroup = this.fb.group({
      graduationDate: [''],
      title: [''],
      department: [''],
      university: [''],
      supervisor: [''],
      grade: [''],
      description: ['']
    });
    
    this.education.push(educationGroup);
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
  }

  // Load existing CV data
  loadCvData(): void {
    this.loading = true;
    this.apiService.getCvData().subscribe({
      next: (data) => {
        if (data) {
          this.cvData = data;
          this.populateForm(data);
          
          // Check if PDF file exists if we have a pdfUrl
          if (data.pdfUrl) {
            this.checkPdfFileExists(data.pdfUrl);
          }
        } else {
          // Initialize with one empty employment and education
          this.addEmployment();
          this.addEducation();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading CV data:', error);
        this.loading = false;
        // Initialize with empty forms if no data exists
        this.addEmployment();
        this.addEducation();
      }
    });
  }

  private checkPdfFileExists(pdfUrl: string): void {
    const fullUrl = `https://portfolio-aymen.onrender.com${pdfUrl}`;
    fetch(fullUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.warn('⚠️ Le fichier PDF configuré n\'existe plus:', fullUrl);
          this.snackBar.open('⚠️ Le fichier PDF configuré n\'existe plus. Veuillez télécharger un nouveau fichier.', 'Fermer', { 
            duration: 5000 
          });
        } else {
          console.log('✅ Fichier PDF vérifié et accessible:', fullUrl);
        }
      })
      .catch(error => {
        console.error('❌ Erreur lors de la vérification du fichier PDF:', error);
      });
  }

  private populateForm(data: any): void {
    // Populate personal information
    this.cvForm.patchValue({
      fullName: data.fullName || '',
      dateOfBirth: data.dateOfBirth || '',
      nationality: data.nationality || '',
      email: data.email || '',
      otherInfo: data.otherInfo || ''
    });

    // Populate academic employment
    if (data.academicEmployment && data.academicEmployment.length > 0) {
      data.academicEmployment.forEach((employment: any) => {
        const employmentGroup = this.fb.group({
          startDate: [employment.startDate || ''],
          endDate: [employment.endDate || ''],
          department: [employment.department || ''],
          institution: [employment.institution || ''],
          position: [employment.position || ''],
          description: [employment.description || '']
        });
        this.academicEmployment.push(employmentGroup);
      });
    } else {
      this.addEmployment();
    }

    // Populate education
    if (data.education && data.education.length > 0) {
      data.education.forEach((edu: any) => {
        const educationGroup = this.fb.group({
          graduationDate: [edu.graduationDate || ''],
          title: [edu.title || ''],
          department: [edu.department || ''],
          university: [edu.university || ''],
          supervisor: [edu.supervisor || ''],
          grade: [edu.grade || ''],
          description: [edu.description || '']
        });
        this.education.push(educationGroup);
      });
    } else {
      this.addEducation();
    }
  }

  // Submit form
  onSubmit(): void {
    if (this.cvForm.valid) {
      this.saving = true;
      
      // If there's a selected file, upload it first
      if (this.selectedCvFile) {
        this.uploadCvFile().then(() => {
          this.saveCvData();
        }).catch(error => {
          console.error('Error uploading CV file:', error);
          this.saving = false;
          this.snackBar.open('Erreur lors de l\'upload du CV', 'Fermer', { duration: 3000 });
        });
      } else {
        this.saveCvData();
      }
    } else {
      this.markFormGroupTouched(this.cvForm);
    }
  }

  private uploadCvFile(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.selectedCvFile) {
        resolve(null);
        return;
      }

      const formData = new FormData();
      formData.append('cv', this.selectedCvFile);

      this.apiService.uploadCVFile(this.selectedCvFile).subscribe({
        next: (response) => {
          // Add the PDF URL to the form data
          if (response && response.cvUrl) {
            this.cvData = { ...this.cvData, pdfUrl: response.cvUrl };
          }
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private saveCvData(): void {
    const formData = this.cvForm.value;
    
    // Include PDF URL if available
    if (this.cvData && this.cvData.pdfUrl) {
      formData.pdfUrl = this.cvData.pdfUrl;
    }
    
    this.apiService.saveCvData(formData).subscribe({
      next: (response) => {
        this.saving = false;
        this.showSuccessMessage = true;
        this.cvData = response;
        this.selectedCvFile = null; // Clear selected file after successful save
        
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error saving CV:', error);
        this.saving = false;
        this.snackBar.open('Erreur lors de la sauvegarde du CV', 'Fermer', { duration: 3000 });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  // Add goBack method
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // Stubs (sécurité contre template ancien en cache) – peuvent être retirés après recompilation propre
  viewCurrentCv(): void { /* template mis à jour ne l'appelle plus */ }
  downloadCvPdf(): void { /* idem */ }

  // CV File handling methods
  onCvFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.snackBar.open('Veuillez sélectionner un fichier PDF', 'Fermer', { duration: 3000 });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.snackBar.open('Le fichier ne doit pas dépasser 10MB', 'Fermer', { duration: 3000 });
        return;
      }
      this.selectedCvFile = file;
    }
  }

  removeCvFile(): void {
    this.selectedCvFile = null;
  }
}
