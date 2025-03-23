import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'dictionary',
    loadChildren: () =>
      import('./features/dictionary/dictionary.module').then(
        (m) => m.DictionaryModule
      ),
  },
  {
    path: 'messaging',
    loadChildren: () =>
      import('./features/messaging/messaging.module').then(
        (m) => m.MessagingModule
      ),
  },
  {
    path: 'communities',
    loadChildren: () =>
      import('./features/communities/communities.module').then(
        (m) => m.CommunitiesModule
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
