import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthResponse, ModulePermission } from 'src/app/auth/model/auth-response';
import { AuthService } from 'src/app/auth/service/auth.service';

@Component({
  selector: 'app-module-selection',
  templateUrl: './module-selection.component.html',
  styleUrls: ['./module-selection.component.css']
})
export class ModuleSelectionComponent {

  userData!: AuthResponse;
  modules: ModulePermission[] = [];
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.userData = this.authService.getUserData();
    this.modules = this.userData.modules;
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    if (this.modules.length === 0) {
      this.snackBar.open('No modules assigned. Contact your administrator.', 'Close', { duration: 5000 });
    } else if (this.modules.length === 1) {
      this.selectModule(this.modules[0].moduleId); // Auto-redirect
    }
  }

  selectModule(moduleId: string): void {
    this.router.navigate(['/dashboard', moduleId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
