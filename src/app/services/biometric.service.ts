import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Vault, BrowserVault, DeviceSecurityType, IdentityVaultConfig, VaultType } from '@ionic-enterprise/identity-vault';
import { BehaviorSubject, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';

const TOKEN_KEY = 'my-token';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  isAuthenticated$: Observable<boolean>;

  // Init with null to filter out the first value in a guard!
	private isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private vault: Vault | BrowserVault;
  constructor() {
    this.isAuthenticated$ = this.isAuthenticated.asObservable();
    const config: IdentityVaultConfig = {
      key: 'io.ionic.demo.login',
      type: VaultType.DeviceSecurity,
      deviceSecurityType: DeviceSecurityType.Biometrics,
      lockAfterBackgrounded: 1000
    };
    this.vault = Capacitor.isNativePlatform() ? new Vault(config) : new BrowserVault(config);
  }

  async isEmpty():Promise<boolean> {
    return await this.vault.isEmpty();
  }

  async isLocked():Promise<boolean> {
    return await this.vault.isLocked();
  }

  async clear():Promise<void> {
    await this.vault.clear();
    this.isAuthenticated.next(false);
  }

  async loginWithBiometrics(): Promise<string> {
    const token = await this.vault.getValue(TOKEN_KEY);
    console.log('loginWithBiometrics', token);
    if(token !== null && token.length > 0) {
      console.log('loginWithBiometrics: isAuthenticated');
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
    return token;
}

login(credentials: { email: string, password: string }): Observable<any> {
  const token = uuid();
  return of({ token }).pipe(
    map((data: any) => data.token),
    switchMap((token) => from(this.vault.setValue(TOKEN_KEY, token))
    ),
    tap((_) => this.isAuthenticated.next(true))
  );
}

async logout(): Promise<void> {
  await this.vault.removeValue(TOKEN_KEY);
  this.isAuthenticated.next(false);
}
}
