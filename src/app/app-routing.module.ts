import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login/login.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { CompanylistComponent } from './company/component/list/companylist/companylist.component';
import { ProfileComponent } from './home/profile/profile/profile.component';
import { CompanyaddeditComponent } from './company/component/addedit/companyaddedit/companyaddedit.component';
import { InventoryListComponent } from './inventory/component/list/inventory-list/inventory-list.component';

const routes: Routes = [

  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  },

  {
    path:'login', component:LoginComponent
  },

  {
    path:'dashboard', component:DashboardComponent, canActivate:[AuthGuard], children: [

      {
        path: 'companies', component: CompanylistComponent
      },

      {
        path: 'companies/add', component: CompanyaddeditComponent // Add this route
      },
      
      {
        path: 'companies/edit/:id', component: CompanyaddeditComponent // Make sure edit route has a parameter for company ID
      },

      {
        path: 'profile', component: ProfileComponent
      },

      {
        path: 'inventory-item', component: InventoryListComponent
      }
      
    ]
  },

  { 
    path: '**', redirectTo: '/login' // Wildcard route for any undefined routes
  }

  // { 
  //   path: '**', redirectTo: '/login' 
  // },  // Wildcard route for any undefined routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
