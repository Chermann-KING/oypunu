import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule],
  providers: [provideHttpClient(withInterceptorsFromDi())],
  exports: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        "CoreModule est déjà chargé. Importez-le uniquement dans l'AppModule."
      );
    }
  }
}
