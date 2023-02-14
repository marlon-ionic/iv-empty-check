import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Device } from '@ionic-enterprise/identity-vault';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BiometricService } from '../services/biometric.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isBiometricsLoginVisible = false;
  isBiometricsLoginDisabled = false;
  credentials: FormGroup;
  authSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
		private biometricService: BiometricService,
		private alertController: AlertController,
		private router: Router,
		private loadingController: LoadingController
  ) {
    this.credentials = this.fb.group({
			email: ['hi@ionicframework.com', [Validators.required, Validators.email]],
			password: ['ThePassword1sPassword!', [Validators.required, Validators.minLength(6)]]
		});
  }

  async ngOnInit() {
    this.isBiometricsLoginVisible = await Device.isBiometricsEnabled();
    this.isBiometricsLoginDisabled = await this.biometricService.isEmpty();
    this.authSubscription = this.biometricService.isAuthenticated$
    .subscribe(async (isAuthenticated) => {
      console.log('LoginPage.login.authSubscription', isAuthenticated);
    });

	}
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  async loginWithBiometrics() {
    const token = await this.biometricService.loginWithBiometrics();
    console.log('loginWithBiometrics', token);
    if(token != null) {
      await this.navigateToApp();
    } else {
      const alert = await this.alertController.create({ message: 'No Token found!', buttons: ['OK']});
      await alert.present();
    }
  }


	async login() {
		const loading = await this.loadingController.create();
		await loading.present();

		this.biometricService.login(this.credentials.value).subscribe({
      next: async () => {
        console.log('LoginPage.login.next');
        await this.navigateToApp();
      },
      error: async (res) => {
        console.log('LoginPage.login.err', res);
				const alert = await this.alertController.create({
					header: 'Login failed',
					message: res.error.error,
					buttons: ['OK']
				});

				await alert.present();
			},
      complete: async () => {
        console.log('LoginPage.login.complete');
        await loading.dismiss();
      }
    });
	}

  private async navigateToApp() {
    await this.router.navigateByUrl('/tabs', { replaceUrl: true });
  }

	// Easy access for form fields
	get email() {
		return this.credentials.get('email');
	}

	get password() {
		return this.credentials.get('password');
	}

}
