import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModulePermission } from 'src/app/auth/model/auth-response';

interface MenuConfig {
  [moduleId: string]: {
    entityIcons?: { [entityId: string]: string };
    entityRoutes?: { [entityId: string]: string };
    entityOrder?: string[];
  };
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  @Input() selectedModule!: ModulePermission | undefined;
  @Input() isDarkMode: boolean = false;
  orderedEntities: any[] = [];

  private menuConfig: MenuConfig = {
    'inventory': {
      entityIcons: {
        'inventory-items': 'inventory',
        'item-categories': 'category',
        'item-types': 'type',
        'stock-adjustment': 'adjust',
        'item-serials': 'adjust'
      },
      entityRoutes: {
        'inventory-items': 'inventory-item',
        'item-categories': 'item-category',
        'item-types': 'item-type', // Assuming a future route
        'stock-adjustment': 'stock-adjustment', // No change if route matches entityId
        'item-serials': 'item-serials' // No change if route matches entityId
      },
      entityOrder: ['inventory-items', 'item-categories', 'item-types', 'stock-adjustment', 'item-serials']
    },
    'car-sales': {
      entityIcons: {
        'cars-category': 'category',
        'car-catalogue': 'car',
        'car-sales': 'sell',
        'car-purchase': 'shopping_cart'
      },
      entityRoutes: {
        'cars-category': 'cars-category', // Adjust based on actual routes
        'car-catalogue': 'car-catalogue',
        'car-sales': 'car-sales',
        'car-purchase': 'car-purchase'
      },
      entityOrder: ['cars-category', 'car-catalogue', 'car-sales', 'car-purchase']
    }
  };

  constructor(private router: Router) {}

  ngOnChanges(): void {
    if (this.selectedModule) {
      const config = this.menuConfig[this.selectedModule.moduleId] || {};
      const order = config.entityOrder || this.selectedModule.entities.map(e => e.entityId);
      this.orderedEntities = order
        .map(id => this.selectedModule?.entities.find(e => e.entityId === id))
        .filter(e => e !== undefined);
    }
  }

  getEntityIcon(entityId: string): string {
    return this.menuConfig[this.selectedModule!.moduleId]?.entityIcons?.[entityId] || 'list';
  }

  getEntityRoute(entityId: string): string {
    return this.menuConfig[this.selectedModule!.moduleId]?.entityRoutes?.[entityId] || entityId;
  }

  navigateToEntity(entityId: string): void {
    const basePath = `/dashboard/${this.selectedModule?.moduleId}`;
    const routePath = this.getEntityRoute(entityId);
    console.log(`Navigating to: ${basePath}/${routePath}`, { entityId, routePath });
    this.router.navigate([`${basePath}/${routePath}`]);
  }

  backToModules(): void {
    this.router.navigate(['/modules']);
  }

  toggleSidebar(): void {
    // Toggle logic if needed
  }  

}
