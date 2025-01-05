import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login/login.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { CompanylistComponent } from './company/component/list/companylist/companylist.component';
import { ProfileComponent } from './home/profile/profile/profile.component';

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
        path: 'profile', component: ProfileComponent
      }
      
    ]
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
