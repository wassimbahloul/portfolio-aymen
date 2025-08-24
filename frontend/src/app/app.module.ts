import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';

// Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Public Components
import { HomeComponent } from './components/public/home/home.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { CvComponent } from './components/public/cv/cv.component';
import { ResearchComponent } from './components/public/research/research.component';
import { PublicationsComponent } from './components/public/publications/publications.component';
import { TalksComponent } from './components/public/talks/talks.component';
import { TeachingComponent } from './components/public/teaching/teaching.component';
import { PhotosComponent } from './components/public/photos/photos.component';

// Admin Components
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

// Services
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';

// Register English locale
registerLocaleData(localeEn);

@NgModule({
  declarations: [
    AppComponent,
    // Public Components
    HomeComponent,
    ContactComponent,
    CvComponent,
    ResearchComponent,
    PublicationsComponent,
    TalksComponent,
    TeachingComponent,
    PhotosComponent,
    // Admin Components
    LoginComponent,
    DashboardComponent,
    AdminHomeComponent,
    AdminContactComponent,
    AdminCvComponent,
    AdminResearchComponent,
    AdminPublicationsComponent,
    AdminTalksComponent,
    AdminTeachingComponent,
    AdminPhotosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    // Angular Material Modules
    MatToolbarModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatExpansionModule,
    MatDialogModule,
    MatMenuModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    ApiService,
    AuthService,
    { provide: LOCALE_ID, useValue: 'en-US' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

