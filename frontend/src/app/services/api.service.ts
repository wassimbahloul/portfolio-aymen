import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://portfolio-aymen.onrender.com/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Authentication API
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  // Home API
  getHome(): Observable<any> {
    return this.http.get(`${this.baseUrl}/home`);
  }

  updateHome(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/home`, data, { headers: this.getAuthHeaders() });
  }

  uploadHomeImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.baseUrl}/home/upload-image`, formData, { headers: this.getAuthHeaders() });
  }

  // Contact API
  getContact(): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact`);
  }

  updateContact(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/contact`, data, { headers: this.getAuthHeaders() });
  }

  // CV API
  // Get CV data
  getCV(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cv`);
  }

  uploadCVFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post(`${this.baseUrl}/cv/upload`, formData, { headers: this.getAuthHeaders() });
  }

  // New CV Data methods
  getCvData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cv/data`, { headers: this.getAuthHeaders() });
  }

  // Public CV Data method (no auth required)
  getPublicCvData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cv/public`);
  }

  saveCvData(cvData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cv/data`, cvData, { headers: this.getAuthHeaders() });
  }

  updateCvData(cvData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/cv/data`, cvData, { headers: this.getAuthHeaders() });
  }

  // Research API
  // Ajoutez ces méthodes à votre ApiService

// Research methods
// Research methods
getResearch(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/research`);
}

getResearchById(id: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/research/${id}`);
}

createResearch(researchData: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/research`, researchData, {
    headers: this.getAuthHeaders()
  });
}

updateResearch(id: string, researchData: any): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/research/${id}`, researchData, {
    headers: this.getAuthHeaders()
  });
}

deleteResearch(id: string): Observable<any> {
  return this.http.delete<any>(`${this.baseUrl}/research/${id}`, {
    headers: this.getAuthHeaders()
  });
}

uploadResearchImage(projectId: string, imageFile: File): Observable<any> {
  const formData = new FormData();
  formData.append('image', imageFile);
  return this.http.post<any>(`${this.baseUrl}/research/${projectId}/upload-image`, formData, {
    headers: this.getAuthHeaders()
  });
}


  // Publications API
  getPublications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/publications`);
  }

  getPublicationById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/publications/${id}`);
  }

  createPublication(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/publications`, data, { headers: this.getAuthHeaders() });
  }

  updatePublication(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/publications/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deletePublication(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/publications/${id}`, { headers: this.getAuthHeaders() });
  }

  uploadPublicationFile(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/publications/${id}/upload`, formData, { headers: this.getAuthHeaders() });
  }

  //talk
  // 🔸 Talks API

  getTalks(filters?: { type?: string }): Observable<any> {
  let url = `${this.baseUrl}/talks`;

  if (filters && filters.type) {
    url += `?type=${encodeURIComponent(filters.type)}`;
  }

  return this.http.get(url);
}

  

  createTalk(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/talks`, data, { headers: this.getAuthHeaders() });
  }

  updateTalk(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/talks/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteTalk(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/talks/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🔼 Upload single slide file
  uploadTalkSlides(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('slides', file);
    return this.http.post(`${this.baseUrl}/talks/${id}/upload`, formData, { headers: this.getAuthHeaders() });
  }

  // 🔼 Upload multiple files
  uploadTalkFiles(talkId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post(`${this.baseUrl}/talks/${talkId}/upload-files`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // ❌ Delete specific file by index
  deleteTalkFile(talkId: string, fileIndex: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/talks/${talkId}/files/${fileIndex}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Teaching API
  // Teaching API
  getTeaching(): Observable<any> {
    return this.http.get(`${this.baseUrl}/teaching`);
  }

  getTeachingById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/teaching/${id}`);
  }

  createTeaching(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/teaching`, data, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateTeaching(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/teaching/${id}`, data, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteTeaching(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/teaching/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  uploadTeachingFiles(id: string, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return this.http.post(`${this.baseUrl}/teaching/${id}/upload`, formData, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Photos API
  getPhotos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/photos`);
  }

  getPhotosAdmin(): Observable<any> {
    return this.http.get(`${this.baseUrl}/photos/admin`, { headers: this.getAuthHeaders() });
  }

  getPhotoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/photos/${id}`, { headers: this.getAuthHeaders() });
  }

  createPhoto(data: any, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photos', file); // Match backend's upload.array('photos')
    formData.append('photoData', JSON.stringify(data));

    return this.http.post(`${this.baseUrl}/photos`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  updatePhoto(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/photos/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deletePhoto(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/photos/${id}`, { headers: this.getAuthHeaders() });
  }

  uploadPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`${this.baseUrl}/photos/upload`, formData, { headers: this.getAuthHeaders() });
  }

  // User Management API
  updateUserProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile`, data, { headers: this.getAuthHeaders() });
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/change-password`, data, { headers: this.getAuthHeaders() });
  }

  // Dashboard Statistics
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/stats`, { headers: this.getAuthHeaders() });
  }
}

