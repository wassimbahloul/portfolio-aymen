import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactData: any = {};
  loading = true;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadContactData();
  }

  loadContactData(): void {
    this.loading = true;
    this.apiService.getContact().subscribe({
      next: (data) => {
        this.contactData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contact data:', error);
        this.loading = false;
      }
    });
  }

  hasSocialLinks(): boolean {
    if (!this.contactData.socialLinks) return false;
    
    return !!(
      this.contactData.socialLinks.linkedin ||
      this.contactData.socialLinks.twitter ||
      this.contactData.socialLinks.researchgate ||
      this.contactData.socialLinks.orcid ||
      this.contactData.socialLinks.googleScholar ||
      this.contactData.socialLinks.website
    );
  }

  hasOfficeInfo(): boolean {
    return !!(
      this.contactData.institution ||
      this.contactData.department ||
      this.contactData.officeNumber ||
      this.contactData.building ||
      this.contactData.office ||
      this.hasAddressInfo()
    );
  }

  hasAddressInfo(): boolean {
    // Check both address structures
    const addressObj = this.contactData.address || {};
    const addressDetails = this.contactData.addressDetails || {};
    
    return !!(
      addressObj.street ||
      addressObj.city ||
      addressObj.postalCode ||
      addressObj.country ||
      addressObj.full ||
      addressDetails.street ||
      addressDetails.city ||
      addressDetails.postalCode ||
      addressDetails.country
    );
  }

  getAddressDisplay(): any {
    // Prioritize addressDetails, fallback to address
    if (this.contactData.addressDetails) {
      const addr = this.contactData.addressDetails;
      if (addr.street || addr.city || addr.postalCode || addr.country) {
        return addr;
      }
    }
    
    // Fallback to address object
    if (this.contactData.address) {
      if (typeof this.contactData.address === 'string') {
        return { full: this.contactData.address };
      }
      return this.contactData.address;
    }
    
    return {};
  }

  hasAvailabilityInfo(): boolean {
    return !!(
      this.contactData.availableForCollaboration ||
      this.contactData.acceptingStudents ||
      this.contactData.availableForReviews
    );
  }

  getPreferredContactLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'email': 'Email',
      'phone': 'Téléphone',
      'office': 'Visite au bureau'
    };
    return methods[method] || method;
  }

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

  formatTime(time: string): string {
    if (!time) return '';
    // Remove seconds if present and format as HH:MM
    return time.substring(0, 5);
  }
}