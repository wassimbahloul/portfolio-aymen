import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Public components
import { HomeComponent } from './components/public/home/home.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { CvComponent } from './components/public/cv/cv.component';
import { ResearchComponent } from './components/public/research/research.component';
import { PublicationsComponent } from './components/public/publications/publications.component';
import { TalksComponent } from './components/public/talks/talks.component';
import { TeachingComponent } from './components/public/teaching/teaching.component';
import { PhotosComponent } from './components/public/photos/photos.component';

// Admin components
import { LoginComponent } from './components/admin/login/login.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';
import { AdminContactComponent } from './components/admin/admin-contact/admin-contact.component';
import { AdminCvComponent } from './components/admin/admin-cv/admin-cv.component';
import { AdminResearchComponent } from './components/admin/admin-research/admin-research.component';
import { AdminPublicationsComponent } from './components/admin/admin-publications/admin-publications.component';
import { AdminTalksComponent } from './components/admin/admin-talks/admin-talks.component';
import { AdminTeachingComponent } from './components/admin/admin-teaching/admin-teaching.component';
import { AdminPhotosComponent } from './components/admin/admin-photos/admin-photos.component';

const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Public routes
  { path: 'home', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'cv', component: CvComponent },
  { path: 'research', component: ResearchComponent },
  { path: 'publications', component: PublicationsComponent },
  { path: 'talks', component: TalksComponent },
  { path: 'teaching', component: TeachingComponent },
  { path: 'photos', component: PhotosComponent },
  
  // Admin routes
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/home', component: AdminHomeComponent },
  { path: 'admin/contact', component: AdminContactComponent },
  { path: 'admin/cv', component: AdminCvComponent },
  { path: 'admin/research', component: AdminResearchComponent },
  { path: 'admin/publications', component: AdminPublicationsComponent },
  { path: 'admin/talks', component: AdminTalksComponent },
  { path: 'admin/teaching', component: AdminTeachingComponent },
  { path: 'admin/photos', component: AdminPhotosComponent },
  
  // Wildcard route
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

