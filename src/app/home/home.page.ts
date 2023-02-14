import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BiometricService } from '../services/biometric.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isAuthenticated = false;
  token?:string;
  constructor(private biometricService: BiometricService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.biometricService.isAuthenticated$.subscribe(isAuthenticated => this.isAuthenticated = isAuthenticated);
  }

  async logout() {
    await this.biometricService.logout();
  }

  async goTologin() {
    await this.router.navigate(['/login'], {replaceUrl: true});
  }

  async reset(){
    await this.biometricService.clear();
  }
  async getToken() {
    const token = await this.biometricService.getToken();
    this.token = token === null? undefined: token;
  }

}
