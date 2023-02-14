import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BiometricService } from './services/biometric.service';

// Set initial value of the vault empty state
export function biometricServiceInitFactory(biometricService: BiometricService) {
  return () => biometricService.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER,
      useFactory: biometricServiceInitFactory,
      deps: [BiometricService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
