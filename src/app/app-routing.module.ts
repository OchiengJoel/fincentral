import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login/login.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { CompanylistComponent } from './company/component/list/companylist/companylist.component';
import { ProfileComponent } from './home/profile/profile/profile.component';
import { CompanyaddeditComponent } from './company/component/addedit/companyaddedit/companyaddedit.component';
import { InventoryListComponent } from './inventory/inventoryitem/component/list/inventory-list/inventory-list.component';
import { ItemcategorylistComponent } from './inventory/itemcategory/component/list/itemcategorylist/itemcategorylist.component';
import { CountrylistComponent } from './country/country/component/list/countrylist/countrylist.component';
import { CountryformComponent } from './country/country/component/form/countryform/countryform.component';
import { LockScreenComponent } from './auth/inactivity/lock-screen/lock-screen.component';
import { ModuleSelectionComponent } from './home/module/module-selection/module-selection.component';
import { PageNotFoundComponent } from './404/page-not-found/page-not-found.component';

const routes: Routes = [

  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  },

  {
    path:'login', component:LoginComponent
  },

  { path: '404', component: PageNotFoundComponent },

  { 
    path: 'modules', component: ModuleSelectionComponent, canActivate: [AuthGuard] 
  },

  {
    path: 'dashboard/:moduleId', component:DashboardComponent, canActivate:[AuthGuard],
    children: [
      { path: 'companies', component: CompanylistComponent },
      { path: 'companies/add', component: CompanyaddeditComponent },
      { path: 'companies/edit/:id', component: CompanyaddeditComponent },
      { path: 'countries/add', component: CountryformComponent },
      { path: 'countries/edit/:id', component: CountryformComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'inventory-item', component: InventoryListComponent },
      { path: 'item-category', component: ItemcategorylistComponent },
      { path: 'countries', component: CountrylistComponent },
      // Add car-sales routes when implemented
      // { path: 'car-catalogue', component: CarCatalogueComponent },
      // { path: 'car-sales', component: CarSalesComponent },
    ]
  },

  { 
    path: '**', redirectTo: '/404' // Wildcard route for any undefined routes
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
