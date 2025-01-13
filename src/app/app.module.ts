import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms'; 
import { JwtModule } from '@auth0/angular-jwt';
import { JwtInterceptorModule } from './auth/jwt-interceptor/jwt-interceptor.module';

import { MatPaginatorModule} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatDrawerContainer, MatSidenavModule} from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './auth/login/login/login.component';
import { RegisterComponent } from './auth/register/register/register.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { CompanylistComponent } from './company/component/list/companylist/companylist.component';
import { CompanyaddeditComponent } from './company/component/addedit/companyaddedit/companyaddedit.component';
import { ProfileComponent } from './home/profile/profile/profile.component';
import { InventoryListComponent } from './inventory/inventoryitem/component/list/inventory-list/inventory-list.component';
import { InventoryFormComponent } from './inventory/inventoryitem/component/addedit/inventory-form/inventory-form.component';
import { ConfirmationDialogComponent } from './company/component/confirmation/confirmation-dialog/confirmation-dialog.component';
import { ItemcategorylistComponent } from './inventory/itemcategory/component/list/itemcategorylist/itemcategorylist.component';
import { ItemcategoryformComponent } from './inventory/itemcategory/component/addedit/itemcategoryform/itemcategoryform.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CompanylistComponent,
    CompanyaddeditComponent,
    ProfileComponent,
    InventoryListComponent,
    InventoryFormComponent,
    ConfirmationDialogComponent,
    ItemcategorylistComponent,
    ItemcategoryformComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatExpansionModule,
    MatSidenavModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatPaginatorModule,
    MatMenuModule,
    MatSortModule,
    FormsModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatDialogModule,
    MatDividerModule,
    MatListModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    AppRoutingModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('access_token'),
        //allowedDomains: ['your-backend-api-url.com'], // change to your actual backend URL
        //disallowedRoutes: ['your-backend-api-url.com/auth/login'],
      },
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorModule, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
