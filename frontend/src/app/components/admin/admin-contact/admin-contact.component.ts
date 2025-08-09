import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-contact',
  templateUrl: './admin-contact.component.html',
  styleUrls: ['./admin-contact.component.css']
})
export class AdminContactComponent implements OnInit {
  contactForm: FormGroup;
  loading = false;
  saving = false;
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadContactInfo();
  }

  createContactForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      fullName: [''],
      title: [''],
      bio: [''],
      
      // Contact Information
      email: ['', [Validators.email]],
      secondaryEmail: ['', [Validators.email]],
      phone: [''],
      mobile: [''],
      
      // Office Information
      institution: [''],
      department: [''],
      officeNumber: [''],
      building: [''],
      address: [''],
      postalCode: [''],
      city: [''],
      country: [''],
      
      // Office Hours
      officeHours: this.fb.array([]),
      
      // Social Media and Professional Links
      linkedin: [''],
      orcid: [''],
      researchGate: [''],
      googleScholar: [''],
      twitter: [''],
      website: [''],
      
      // Additional Links
      additionalLinks: this.fb.array([]),
      
      // Contact Preferences
      preferredContact: ['email'],
      contactInstructions: [''],
      availableForCollaboration: [false],
      acceptingStudents: [false],
      availableForReviews: [false]
    });
  }

  get officeHours(): FormArray {
    return this.contactForm.get('officeHours') as FormArray;
  }

  get additionalLinks(): FormArray {
    return this.contactForm.get('additionalLinks') as FormArray;
  }

  loadContactInfo(): void {
    this.loading = true;
    this.apiService.getContact().subscribe({
      next: (data) => {
        if (data) {
          this.populateForm(data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contact info:', error);
        this.loading = false;
      }
    });
  }

 populateForm(data: any): void {
  // Populate basic fields
  this.contactForm.patchValue({
    fullName: data.fullName || '',
    title: data.title || '',
    bio: data.bio || '',
    email: data.email || '',
    secondaryEmail: data.secondaryEmail || '',
    phone: data.phone || '',
    mobile: data.mobile || '',
    institution: data.institution || '',
    department: data.department || '',
    officeNumber: data.officeNumber || '',
    building: data.building || '',
    
    // Handle different address structures
    address: this.getAddressText(data),
    postalCode: this.getAddressField(data, 'postalCode'),
    city: this.getAddressField(data, 'city'),
    country: this.getAddressField(data, 'country'),
    
    linkedin: data.socialLinks?.linkedin || '',
    orcid: data.socialLinks?.orcid || '',
    researchGate: data.socialLinks?.researchGate || '',
    googleScholar: data.socialLinks?.googleScholar || '',
    twitter: data.socialLinks?.twitter || '',
    website: data.socialLinks?.website || '',
    preferredContact: data.preferredContact || 'email',
    contactInstructions: data.contactInstructions || '',
    availableForCollaboration: data.availableForCollaboration || false,
    acceptingStudents: data.acceptingStudents || false,
    availableForReviews: data.availableForReviews || false
  });

  // Populate office hours
  const officeHoursArray = this.officeHours;
  officeHoursArray.clear();
  if (data.officeHours && data.officeHours.length > 0) {
    data.officeHours.forEach((hour: any) => {
      officeHoursArray.push(this.fb.group({
        day: [hour.day || ''],
        startTime: [hour.startTime || ''],
        endTime: [hour.endTime || '']
      }));
    });
  }

  // Populate additional links
  const additionalLinksArray = this.additionalLinks;
  additionalLinksArray.clear();
  if (data.additionalLinks && data.additionalLinks.length > 0) {
    data.additionalLinks.forEach((link: any) => {
      additionalLinksArray.push(this.fb.group({
        title: [link.title || ''],
        url: [link.url || ''],
        description: [link.description || '']
      }));
    });
  }
}

// Ajoutez ces méthodes helper:

private getAddressText(data: any): string {
  if (data.address) {
    if (typeof data.address === 'string') {
      return data.address;
    }
    if (data.address.full) {
      return data.address.full;
    }
  }
  return '';
}

private getAddressField(data: any, field: string): string {
  // Try addressDetails first
  if (data.addressDetails && data.addressDetails[field]) {
    return data.addressDetails[field];
  }
  
  // Fallback to address object
  if (data.address && typeof data.address === 'object' && data.address[field]) {
    return data.address[field];
  }
  
  return '';
}

  addOfficeHour(): void {
    this.officeHours.push(this.fb.group({
      day: [''],
      startTime: [''],
      endTime: ['']
    }));
  }

  removeOfficeHour(index: number): void {
    this.officeHours.removeAt(index);
  }

  addAdditionalLink(): void {
    this.additionalLinks.push(this.fb.group({
      title: [''],
      url: [''],
      description: ['']
    }));
  }

  removeAdditionalLink(index: number): void {
    this.additionalLinks.removeAt(index);
  }

  saveContact(): void {
    if (!this.contactForm.valid) {
      this.markFormGroupTouched(this.contactForm);
      return;
    }

    this.saving = true;
    const formData = this.prepareFormData();

    this.apiService.updateContact(formData).subscribe({
      next: (response) => {
        this.saving = false;
        this.showSuccessMessage = true;
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error saving contact info:', error);
        this.saving = false;
        // You could add error handling here (show error message)
      }
    });
  }

 prepareFormData(): any {
  const formValue = this.contactForm.value;
  
  // Filter out empty office hours
  const officeHours = formValue.officeHours.filter((hour: any) => 
    hour.day && hour.startTime && hour.endTime
  );

  // Filter out empty additional links
  const additionalLinks = formValue.additionalLinks.filter((link: any) => 
    link.title || link.url
  );

  return {
    fullName: formValue.fullName,
    title: formValue.title,
    bio: formValue.bio,
    email: formValue.email,
    secondaryEmail: formValue.secondaryEmail,
    phone: formValue.phone,
    mobile: formValue.mobile,
    institution: formValue.institution,
    department: formValue.department,
    officeNumber: formValue.officeNumber,
    building: formValue.building,
    
    // Structure the address properly
    address: {
      street: '',
      city: formValue.city || '',
      postalCode: formValue.postalCode || '',
      country: formValue.country || '',
      full: formValue.address || '' // Store the full address text
    },
    
    // Also send addressDetails for better structure
    addressDetails: {
      street: '',
      city: formValue.city || '',
      postalCode: formValue.postalCode || '',
      country: formValue.country || ''
    },
    
    officeHours: officeHours,
    
    socialLinks: {
      linkedin: formValue.linkedin || '',
      orcid: formValue.orcid || '',
      researchGate: formValue.researchGate || '',
      googleScholar: formValue.googleScholar || '',
      twitter: formValue.twitter || '',
      website: formValue.website || ''
    },
    
    additionalLinks: additionalLinks,
    preferredContact: formValue.preferredContact,
    contactInstructions: formValue.contactInstructions,
    availableForCollaboration: formValue.availableForCollaboration,
    acceptingStudents: formValue.acceptingStudents,
    availableForReviews: formValue.availableForReviews
  };
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Helper method to get day label in French
  getDayLabel(day: string): string {
    const days: { [key: string]: string } = {
      'monday': 'Lundi',
      'tuesday': 'Mardi',
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi'
    };
    return days[day] || day;
  }

  // Helper method to format time
  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5); // Remove seconds if present
  }

  // Helper method to validate URL
  isValidUrl(url: string): boolean {
    if (!url) return true; // Empty URLs are valid (optional fields)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to validate email
  isValidEmail(email: string): boolean {
    if (!email) return true; // Empty emails are valid (optional fields)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

